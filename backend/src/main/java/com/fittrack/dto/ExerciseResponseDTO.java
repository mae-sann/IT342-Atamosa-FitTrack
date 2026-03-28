package com.fittrack.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExerciseResponseDTO(
        Long id,
        String name,
        @JsonProperty("muscle_group")
        String muscleGroup,
        String description
) {
}
