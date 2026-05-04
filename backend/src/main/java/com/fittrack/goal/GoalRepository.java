package com.fittrack.goal;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fittrack.shared.entity.Goal;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserEmailOrderByCreatedAtDesc(String email);

    Optional<Goal> findByIdAndUserEmail(Long id, String email);
}
