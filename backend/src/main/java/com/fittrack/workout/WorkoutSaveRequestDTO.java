package com.fittrack.workout;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WorkoutSaveRequestDTO(
        @NotNull(message = "Workout date is required")
        String workoutDate,  // Accept as String - can be "2026-05-10" or "2026-05-10T16:15:45"

        String workoutName,

        @Valid
        List<WorkoutLogSaveRequestDTO> logs
) {
    public record WorkoutLogSaveRequestDTO(
            @NotBlank(message = "Exercise name is required")
            String exerciseName,

            String muscleGroup,

            @Min(value = 1, message = "Sets must be at least 1")
            Integer sets,

            @Min(value = 1, message = "Reps must be at least 1")
            Integer reps
    ) {
    }
}