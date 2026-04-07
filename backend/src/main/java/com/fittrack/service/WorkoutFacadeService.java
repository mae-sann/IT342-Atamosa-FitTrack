package com.fittrack.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.dto.WorkoutSaveRequestDTO;
import com.fittrack.dto.WorkoutResponseDTO;
import com.fittrack.entity.User;
import com.fittrack.event.WorkoutSavedEvent;
import com.fittrack.repository.UserRepository;

@Service
@Transactional
public class WorkoutFacadeService {

    private final WorkoutService workoutService;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public WorkoutFacadeService(
            WorkoutService workoutService,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.workoutService = workoutService;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * FACADE PATTERN: Orchestrates the complete workout save workflow
     * 
     * This facade hides complexity from the controller and provides
     * a single entry point for saving workouts with all side effects.
     * 
     * Future extensions (add without changing controller):
     * - Send push notification after workout save
     * - Update goal progress tracking
     * - Log analytics event
     * - Sync with Apple Health / Google Fit
     * - Update user streak counter
     */
    public Object saveWorkoutWithDetails(String userEmail, WorkoutSaveRequestDTO request) {
        
        System.out.println("═══════════════════════════════════════");
        System.out.println("🔵 [FACADE] Starting workout save workflow");
        System.out.println("🔵 [FACADE] User: " + userEmail);
        System.out.println("🔵 [FACADE] Workout date: " + request.workoutDate());
        System.out.println("🔵 [FACADE] Workout name: " + request.workoutName());
        System.out.println("🔵 [FACADE] Number of logs: " + 
            (request.logs() != null ? request.logs().size() : 0));
        System.out.println("═══════════════════════════════════════");
        
        // Step 1: Save the workout using existing service
        WorkoutResponseDTO savedWorkout = workoutService.saveWorkout(userEmail, request);
        System.out.println("✅ [FACADE] Step 1 complete: Workout saved via WorkoutService");

        User user = userRepository.findByEmail(userEmail).orElse(null);
        String firstName = user != null ? user.getFirstName() : "Athlete";

        eventPublisher.publishEvent(new WorkoutSavedEvent(
            savedWorkout.id(),
            userEmail,
            firstName,
            savedWorkout.workoutDate(),
            savedWorkout.totalExercises() != null ? savedWorkout.totalExercises() : 0
        ));
        System.out.println("✅ [FACADE] Step 2 complete: WorkoutSavedEvent published");
        
        // Step 3: FUTURE - Update goal progress
        // goalProgressService.checkAndUpdateGoals(userEmail);
        
        // Step 4: FUTURE - Update workout streak
        // streakService.updateStreak(userEmail, request.workoutDate());
        
        // Step 5: FUTURE - Log for analytics
        // analyticsService.logWorkoutCompletion(userEmail, request.logs().size());
        
        System.out.println("═══════════════════════════════════════");
        System.out.println("✅ [FACADE] Workout workflow completed successfully");
        System.out.println("═══════════════════════════════════════");
        
        return savedWorkout;
    }
}