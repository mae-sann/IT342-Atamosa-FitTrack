package com.fittrack.goal;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record GoalUpdateRequestDTO(
        @JsonProperty("current_value")
        @NotNull(message = "current_value is required")
        @DecimalMin(value = "0.00", message = "current_value must be 0 or greater")
        BigDecimal currentValue
) {
}
