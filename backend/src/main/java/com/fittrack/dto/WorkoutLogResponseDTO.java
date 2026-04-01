package com.fittrack.dto;

import java.time.LocalDateTime;

public record WorkoutLogResponseDTO(
        Long id,
        String exerciseName,
        Integer sets,
        Integer reps,
        LocalDateTime workoutDate,
        LocalDateTime createdAt
) {
}