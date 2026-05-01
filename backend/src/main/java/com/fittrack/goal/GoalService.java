package com.fittrack.goal;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.goal.GoalCreateRequestDTO;
import com.fittrack.goal.GoalResponseDTO;
import com.fittrack.goal.GoalUpdateRequestDTO;
import com.fittrack.shared.entity.Goal;
import com.fittrack.shared.entity.User;
import com.fittrack.goal.GoalRepository;
import com.fittrack.user.UserRepository;
import com.fittrack.goal.GoalValidationStrategy;
import com.fittrack.shared.exception.ResourceNotFoundException;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    
    // STRATEGY PATTERN - Map of strategies injected by Spring
    @Autowired
    private Map<String, GoalValidationStrategy> strategies;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<GoalResponseDTO> getGoals(String email) {
        return goalRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GoalResponseDTO createGoal(String email, GoalCreateRequestDTO request) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setGoalText(request.goalText().trim());
        goal.setTargetValue(request.targetValue());
        goal.setCurrentValue(request.currentValue() != null ? request.currentValue() : BigDecimal.ZERO);
        goal.setGoalType(request.goalType() != null ? request.goalType() : "default");
        goal.setAchieved(checkGoalAchieved(goal, user));

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponseDTO updateGoal(String email, Long id, GoalUpdateRequestDTO request) {
        Goal goal = goalRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        goal.setCurrentValue(request.currentValue());
        
        // STRATEGY PATTERN - Check if goal is achieved after update
        User user = goal.getUser();
        boolean isAchieved = checkGoalAchieved(goal, user);
        goal.setAchieved(isAchieved);

        if (isAchieved) {
            System.out.println("🎯 [STRATEGY] Goal achieved! " + goal.getGoalText());
        }
        
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(String email, Long id) {
        Goal goal = goalRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }
    
    /**
     * STRATEGY PATTERN - Dynamically selects validation strategy based on goal type
     */
    public boolean checkGoalAchieved(Goal goal, User user) {
        String strategyKey = normalizeGoalType(goal.getGoalType());
        
        GoalValidationStrategy strategy = strategies.get(strategyKey);
        
        if (strategy == null) {
            System.out.println("⚠️ [STRATEGY] No strategy found for type: " + strategyKey + ", using default");
            strategy = strategies.get("default");
        }
        
        if (strategy == null) {
            System.out.println("❌ [STRATEGY] No strategy available!");
            return false;
        }
        
        return strategy.validate(goal, user);
    }

    private String normalizeGoalType(String goalType) {
        if (goalType == null || goalType.isBlank()) {
            return "default";
        }
        return goalType.trim().toLowerCase().replace(' ', '_');
    }

    private GoalResponseDTO toResponse(Goal goal) {
        return new GoalResponseDTO(
                goal.getId(),
                goal.getUser().getId(),
                goal.getGoalText(),
                goal.getGoalType(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                goal.isAchieved(),
                goal.getCreatedAt()
        );
    }
}