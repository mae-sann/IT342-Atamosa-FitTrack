package com.fittrack.admin;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.exercise.ExerciseRepository;
import com.fittrack.user.UserRepository;
import com.fittrack.workout.WorkoutRepository;

@Service
public class AdminStatsService {

    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public AdminStatsService(
            UserRepository userRepository,
            WorkoutRepository workoutRepository,
            ExerciseRepository exerciseRepository
    ) {
        this.userRepository = userRepository;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay().minusNanos(1);

        LocalDate weekStartDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime startOfWeek = weekStartDate.atStartOfDay();

        long totalUsers = userRepository.count();
        long newUsersThisWeek = userRepository.countByCreatedAtBetween(startOfWeek, endOfToday);

        long totalWorkouts = workoutRepository.count();
        long workoutsToday = workoutRepository.countByWorkoutDateBetween(startOfToday, endOfToday);

        long totalExercises = exerciseRepository.count();
        long categoryCount = exerciseRepository.countDistinctMuscleGroups();

        long activeToday = workoutRepository.countDistinctActiveUsersByWorkoutDateBetween(startOfToday, endOfToday);
        long activePercentage = totalUsers == 0
                ? 0
                : Math.round((activeToday * 100.0) / totalUsers);

        return new AdminStatsResponse(
                totalUsers,
                newUsersThisWeek,
                totalWorkouts,
                workoutsToday,
                totalExercises,
                categoryCount,
                activeToday,
                activePercentage
        );
    }

    public record AdminStatsResponse(
            long totalUsers,
            long newUsersThisWeek,
            long totalWorkouts,
            long workoutsToday,
            long totalExercises,
            long categoryCount,
            long activeToday,
            long activePercentage
    ) {
    }
}
