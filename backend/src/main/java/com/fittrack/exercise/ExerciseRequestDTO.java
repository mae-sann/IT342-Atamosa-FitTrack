package com.fittrack.exercise;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ExerciseRequestDTO(
        @NotBlank(message = "Exercise name is required")
        @Size(max = 150, message = "Exercise name must be at most 150 characters")
        String name,

        @JsonProperty("muscle_group")
        @JsonAlias("category")
        @NotBlank(message = "Category is required")
        @Size(max = 100, message = "Category must be at most 100 characters")
        String muscleGroup,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description
) {
}
