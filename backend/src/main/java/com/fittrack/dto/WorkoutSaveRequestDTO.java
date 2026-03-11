package com.fittrack.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WorkoutSaveRequestDTO(
        @NotBlank(message = "Workout title is required")
        @Size(max = 150, message = "Workout title must be at most 150 characters")
        String title,

        @Size(max = 500, message = "Workout notes must be at most 500 characters")
        String notes,

        LocalDateTime performedAt
) {
}