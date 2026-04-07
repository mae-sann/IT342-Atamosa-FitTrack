package com.fittrack.event;

import java.time.LocalDateTime;

public record WorkoutSavedEvent(
        Long workoutId,
        String userEmail,
        String userFirstName,
        LocalDateTime workoutDate,
        int totalExercises
) {
}
