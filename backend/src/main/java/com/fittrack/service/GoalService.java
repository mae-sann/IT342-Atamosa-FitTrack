package com.fittrack.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.dto.GoalCreateRequestDTO;
import com.fittrack.dto.GoalResponseDTO;
import com.fittrack.dto.GoalUpdateRequestDTO;
import com.fittrack.entity.Goal;
import com.fittrack.repository.GoalRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.util.ResourceNotFoundException;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

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

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponseDTO updateGoal(String email, Long id, GoalUpdateRequestDTO request) {
        Goal goal = goalRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        goal.setCurrentValue(request.currentValue());
        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(String email, Long id) {
        Goal goal = goalRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalResponseDTO toResponse(Goal goal) {
        return new GoalResponseDTO(
                goal.getId(),
                goal.getUser().getId(),
                goal.getGoalText(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                goal.getCreatedAt()
        );
    }
}
