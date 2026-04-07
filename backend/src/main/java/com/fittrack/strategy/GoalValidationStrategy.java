package com.fittrack.strategy;

import com.fittrack.entity.Goal;
import com.fittrack.entity.User;

public interface GoalValidationStrategy {
    boolean validate(Goal goal, User user);
    String getGoalType();
}