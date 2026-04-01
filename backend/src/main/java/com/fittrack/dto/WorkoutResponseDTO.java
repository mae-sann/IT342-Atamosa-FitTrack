package com.fittrack.dto;

import java.time.LocalDateTime;

public record WorkoutResponseDTO(
        Long id,
        LocalDateTime workoutDate,
        LocalDateTime createdAt,
        Integer totalExercises
) {
}