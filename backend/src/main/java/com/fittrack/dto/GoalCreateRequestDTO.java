package com.fittrack.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GoalCreateRequestDTO(
        @JsonProperty("goal_text")
        @NotBlank(message = "goal_text is required")
        @Size(max = 255, message = "goal_text must be at most 255 characters")
        String goalText,

        @JsonProperty("goal_type")
        String goalType,

        @JsonProperty("target_value")
        @NotNull(message = "target_value is required")
        @DecimalMin(value = "0.01", message = "target_value must be greater than 0")
        BigDecimal targetValue,

        @JsonProperty("current_value")
        BigDecimal currentValue
) {
}
