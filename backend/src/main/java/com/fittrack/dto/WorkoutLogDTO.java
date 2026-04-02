package com.fittrack.dto;

public record WorkoutLogDTO(
        Long id,
        String exerciseName,
        String muscleGroup,
        Integer sets,
        Integer reps
) {
}