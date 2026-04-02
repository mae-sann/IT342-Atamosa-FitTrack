package com.fittrack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoalResponseDTO(
        Long id,
        @JsonProperty("user_id")
        Long userId,
        @JsonProperty("goal_text")
        String goalText,
        @JsonProperty("target_value")
        BigDecimal targetValue,
        @JsonProperty("current_value")
        BigDecimal currentValue,
        @JsonProperty("created_at")
        LocalDateTime createdAt
) {
}
