package com.fittrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.fittrack.entity.Exercise;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByNameIgnoreCase(String name);

        @Query("""
                        select count(distinct e.muscleGroup)
                        from Exercise e
                        where e.muscleGroup is not null
                            and trim(e.muscleGroup) <> ''
                        """)
        long countDistinctMuscleGroups();
}