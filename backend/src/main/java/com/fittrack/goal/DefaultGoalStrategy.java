package com.fittrack.goal;

import com.fittrack.shared.entity.Goal;
import com.fittrack.shared.entity.User;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component("default")
public class DefaultGoalStrategy implements GoalValidationStrategy {
    
    @Override
    public boolean validate(Goal goal, User user) {
        System.out.println("🔵 [STRATEGY] Using default goal validation");
        
        // Compare current value vs target value
        BigDecimal current = goal.getCurrentValue() != null ? goal.getCurrentValue() : BigDecimal.ZERO;
        BigDecimal target = goal.getTargetValue() != null ? goal.getTargetValue() : BigDecimal.ZERO;
        boolean achieved = current.compareTo(target) >= 0;
        
        System.out.println("  - Current value: " + current);
        System.out.println("  - Target value: " + target);
        System.out.println("  - Achieved: " + achieved);
        
        return achieved;
    }
    
    @Override
    public String getGoalType() {
        return "default";
    }
}