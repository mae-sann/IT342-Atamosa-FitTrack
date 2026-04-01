package com.fittrack.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutDetailResponseDTO(
        Long id,
        LocalDateTime workoutDate,
        LocalDateTime createdAt,
        List<WorkoutLogItemDTO> logs
) {
    public record WorkoutLogItemDTO(
            String exerciseName,
            Integer sets,
            Integer reps
    ) {
    }
}
