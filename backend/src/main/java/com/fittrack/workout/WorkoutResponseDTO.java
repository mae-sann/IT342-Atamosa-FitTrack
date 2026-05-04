package com.fittrack.workout;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutResponseDTO(
        Long id,
        String title,
        LocalDateTime workoutDate,
        LocalDateTime createdAt,
        Integer totalExercises,
        List<WorkoutLogDTO> logs
) {
}