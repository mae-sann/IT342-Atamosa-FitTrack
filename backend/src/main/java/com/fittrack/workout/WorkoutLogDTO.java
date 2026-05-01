package com.fittrack.workout;

public record WorkoutLogDTO(
        Long id,
        String exerciseName,
        String muscleGroup,
        Integer sets,
        Integer reps
) {
}