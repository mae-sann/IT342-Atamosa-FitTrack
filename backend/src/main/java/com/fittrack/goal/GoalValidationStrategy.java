package com.fittrack.goal;

import com.fittrack.shared.entity.Goal;
import com.fittrack.shared.entity.User;

public interface GoalValidationStrategy {
    boolean validate(Goal goal, User user);
    String getGoalType();
}