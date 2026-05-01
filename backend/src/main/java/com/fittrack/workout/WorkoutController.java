package com.fittrack.workout;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fittrack.workout.WorkoutSaveRequestDTO;
import com.fittrack.workout.WorkoutFacadeService;
import com.fittrack.workout.WorkoutService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/workouts", "/api/v1/workouts"})
public class WorkoutController {

    private final WorkoutService workoutService;
    private final WorkoutFacadeService workoutFacadeService;

    // Add this constructor with print statement
    public WorkoutController(WorkoutService workoutService, WorkoutFacadeService workoutFacadeService) {
        this.workoutService = workoutService;
        this.workoutFacadeService = workoutFacadeService;
        System.out.println("✅✅✅ WORKOUT CONTROLLER LOADED! ✅✅✅");
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkouts(Authentication authentication) {
        System.out.println("GET /api/workouts called by: " + authentication.getName());
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
        System.out.println("POST /api/workouts called by: " + authentication.getName());
        System.out.println("Workout data: " + request);
        
        var savedWorkout = workoutFacadeService.saveWorkoutWithDetails(
            authentication.getName(), 
            request
        );

        return ResponseEntity.ok(Map.of(
                "message", "Workout saved successfully",
                "item", savedWorkout
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteWorkout(
            Authentication authentication,
            @PathVariable Long id
    ) {
        workoutService.deleteWorkout(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Workout deleted successfully"));
    }
}