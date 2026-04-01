package com.fittrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fittrack.entity.WorkoutLog;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByWorkoutIdOrderByCreatedAtDesc(Long workoutId);

    void deleteByWorkoutId(Long workoutId);
}