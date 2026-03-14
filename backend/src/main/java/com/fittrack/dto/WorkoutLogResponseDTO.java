package com.fittrack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WorkoutLogResponseDTO(
        Long id,
        Long exerciseId,
        String exerciseName,
        Integer setsCompleted,
        Integer repsCompleted,
        BigDecimal weightKg,
        Integer durationMinutes,
        String notes,
        LocalDateTime loggedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}