package com.fittrack.strategy;

import com.fittrack.entity.Goal;
import com.fittrack.entity.User;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component("workout_frequency")
public class WorkoutFrequencyStrategy implements GoalValidationStrategy {
    
    @Override
    public boolean validate(Goal goal, User user) {
        System.out.println("🔵 [STRATEGY] Checking workout frequency goal");
        
        // Count workouts in last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long workoutCount = user.getWorkouts() != null ? 
            user.getWorkouts().stream()
                .filter(w -> w.getWorkoutDate() != null && w.getWorkoutDate().isAfter(thirtyDaysAgo))
                .count() : 0;
        
        // Compare with target value
        int target = goal.getTargetValue() != null ? goal.getTargetValue().intValue() : 0;
        boolean achieved = workoutCount >= target;
        
        System.out.println("  - Workouts (30 days): " + workoutCount);
        System.out.println("  - Target: " + target);
        System.out.println("  - Achieved: " + achieved);
        
        return achieved;
    }
    
    @Override
    public String getGoalType() {
        return "workout_frequency";
    }
}