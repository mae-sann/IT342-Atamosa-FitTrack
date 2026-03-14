package com.fittrack.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutResponseDTO(
        Long id,
        String title,
        String notes,
        LocalDateTime performedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<WorkoutLogResponseDTO> logs
) {
}