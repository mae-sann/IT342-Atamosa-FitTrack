package com.fittrack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fittrack.dto.WorkoutSaveRequestDTO;
import com.fittrack.entity.User;
import com.fittrack.entity.Workout;
import com.fittrack.repository.UserRepository;
import com.fittrack.repository.WorkoutRepository;
import com.fittrack.service.EmailService;
import com.fittrack.util.ResourceNotFoundException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public WorkoutController(
            WorkoutRepository workoutRepository,
            UserRepository userRepository,
            EmailService emailService
    ) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkouts(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "items", workoutRepository.findByUserEmailOrderByPerformedAtDesc(authentication.getName()),
                "message", "Protected workouts endpoint"
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveWorkout(
            Authentication authentication,
            @Valid @RequestBody WorkoutSaveRequestDTO request
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workout workout = new Workout();
        workout.setTitle(request.title());
        workout.setNotes(request.notes());
        workout.setPerformedAt(request.performedAt());
        workout.setUser(user);

        Workout savedWorkout = workoutRepository.save(workout);
        sendWorkoutNotificationSafely(user);

        return ResponseEntity.ok(Map.of(
                "message", "Workout saved successfully",
                "workoutId", savedWorkout.getId(),
                "title", savedWorkout.getTitle()
        ));
    }

    private void sendWorkoutNotificationSafely(User user) {
        try {
            emailService.sendWorkoutSavedEmail(user.getEmail(), user.getFirstName());
        } catch (Exception ignored) {
        }
    }
}
