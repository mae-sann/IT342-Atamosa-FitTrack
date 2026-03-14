package com.fittrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fittrack.entity.Exercise;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByNameIgnoreCase(String name);
}