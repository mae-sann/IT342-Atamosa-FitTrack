package com.fittrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fittrack.entity.Workout;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUserEmailOrderByPerformedAtDesc(String email);
}