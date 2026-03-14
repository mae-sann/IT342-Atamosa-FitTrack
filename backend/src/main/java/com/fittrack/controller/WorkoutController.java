package com.fittrack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fittrack.dto.WorkoutSaveRequestDTO;
import com.fittrack.service.WorkoutService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkouts(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "items", workoutService.getWorkouts(authentication.getName()),
                "message", "Workouts retrieved successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getWorkoutById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(Map.of(
                "item", workoutService.getWorkoutById(authentication.getName(), id),
                "message", "Workout retrieved successfully"
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveWorkout(
            Authentication authentication,
            @Valid @RequestBody WorkoutSaveRequestDTO request
    ) {
        var savedWorkout = workoutService.saveWorkout(authentication.getName(), request);

        return ResponseEntity.ok(Map.of(
                "message", "Workout saved successfully",
                "item", savedWorkout
        ));
    }
}
