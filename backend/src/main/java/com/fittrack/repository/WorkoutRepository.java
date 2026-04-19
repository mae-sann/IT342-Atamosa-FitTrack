package com.fittrack.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fittrack.entity.Workout;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    @EntityGraph(attributePaths = { "logs" })
    List<Workout> findByUserEmailOrderByWorkoutDateDesc(String email);

    @EntityGraph(attributePaths = { "logs" })
    Optional<Workout> findByIdAndUserEmail(Long id, String email);

        long countByWorkoutDateBetween(LocalDateTime start, LocalDateTime end);

        @Query("""
            select count(distinct w.user.id)
            from Workout w
            where w.workoutDate between :start and :end
            """)
        long countDistinctActiveUsersByWorkoutDateBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
        );

        @Query("""
            select w.user.id, count(w.id)
            from Workout w
            where w.user.id in :userIds
            group by w.user.id
            """)
        List<Object[]> countWorkoutsByUserIds(@Param("userIds") List<Long> userIds);

        @Query("""
            select distinct w.user.id
            from Workout w
            where w.user.id in :userIds
              and w.workoutDate >= :since
            """)
        List<Long> findActiveUserIdsSince(
            @Param("userIds") List<Long> userIds,
            @Param("since") LocalDateTime since
        );
}