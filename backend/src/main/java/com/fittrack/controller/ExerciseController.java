package com.fittrack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fittrack.dto.ExerciseRequestDTO;
import com.fittrack.service.ExerciseService;

import jakarta.validation.Valid;

//For Phase 3 Web Development
@RestController
@Validated
@RequestMapping({ "/api/v1/exercises", "/api/exercises" })
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getExercises() {
        return ResponseEntity.ok(Map.of(
                "items", exerciseService.getAllExercises(),
                "message", "Exercises retrieved successfully"
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createExercise(@Valid @RequestBody ExerciseRequestDTO request) {
        return ResponseEntity.ok(Map.of(
                "item", exerciseService.createExercise(request),
                "message", "Exercise created successfully"
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateExercise(@PathVariable Long id, @Valid @RequestBody ExerciseRequestDTO request) {
        return ResponseEntity.ok(Map.of(
                "item", exerciseService.updateExercise(id, request),
                "message", "Exercise updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.ok(Map.of("message", "Exercise deleted successfully"));
    }
}
