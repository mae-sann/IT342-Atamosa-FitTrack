package com.fittrack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fittrack.dto.GoalCreateRequestDTO;
import com.fittrack.dto.GoalUpdateRequestDTO;
import com.fittrack.service.GoalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getGoals(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "items", goalService.getGoals(authentication.getName()),
                "message", "Goals retrieved successfully"
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createGoal(
            Authentication authentication,
            @Valid @RequestBody GoalCreateRequestDTO request
    ) {
        return ResponseEntity.ok(Map.of(
                "item", goalService.createGoal(authentication.getName(), request),
                "message", "Goal created successfully"
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateGoal(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody GoalUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(Map.of(
                "item", goalService.updateGoal(authentication.getName(), id, request),
                "message", "Goal updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteGoal(
            Authentication authentication,
            @PathVariable Long id
    ) {
        goalService.deleteGoal(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Goal deleted successfully"));
    }
}
