package com.fittrack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkouts() {
        // Placeholder protected endpoint to validate JWT-protected mobile/web access.
        return ResponseEntity.ok(Map.of(
                "items", List.of(),
                "message", "Protected workouts endpoint"
        ));
    }
}
