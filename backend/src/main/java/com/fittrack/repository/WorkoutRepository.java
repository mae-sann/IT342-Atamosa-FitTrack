package com.fittrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fittrack.entity.Workout;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    @EntityGraph(attributePaths = { "logs", "logs.exercise" })
    List<Workout> findByUserEmailOrderByPerformedAtDesc(String email);

    @EntityGraph(attributePaths = { "logs", "logs.exercise" })
    Optional<Workout> findByIdAndUserEmail(Long id, String email);
}