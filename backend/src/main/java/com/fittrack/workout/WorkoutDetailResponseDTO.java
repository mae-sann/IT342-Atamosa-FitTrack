package com.fittrack.workout;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutDetailResponseDTO(
        Long id,
        String title,
        LocalDateTime workoutDate,
        LocalDateTime createdAt,
        List<WorkoutLogDTO> logs
) {
}
