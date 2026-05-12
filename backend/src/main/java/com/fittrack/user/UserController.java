package com.fittrack.user;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fittrack.shared.security.FittrackUserDetails;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/users", "/api/v1/users"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal FittrackUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User details not found in authentication");
        }

        String email = userDetails.getUsername();
        if (email == null || email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email not available in authentication");
        }

        UserResponseDTO user = userService.getCurrentUser(email);
        // Convert LocalDateTime to ISO string for JSON serialization
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.id());
        userData.put("email", user.email());
        userData.put("firstName", user.firstName());
        userData.put("lastName", user.lastName());
        userData.put("role", user.role());
        userData.put("provider", user.provider());
        userData.put("createdAt", user.createdAt() != null ? user.createdAt().toString() : null);
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", userData);
        response.put("success", true);
        response.put("error", null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDTO request,
            @AuthenticationPrincipal FittrackUserDetails userDetails
    ) {
        UserResponseDTO user = userService.updateProfile(userDetails.getUsername(), request);
        // Convert LocalDateTime to ISO string for JSON serialization
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.id());
        userData.put("email", user.email());
        userData.put("firstName", user.firstName());
        userData.put("lastName", user.lastName());
        userData.put("role", user.role());
        userData.put("provider", user.provider());
        userData.put("createdAt", user.createdAt() != null ? user.createdAt().toString() : null);
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", userData);
        response.put("success", true);
        response.put("error", null);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(Map.of(
                "items", users,
                "message", "Users retrieved successfully"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal FittrackUserDetails userDetails
    ) {
        if (userDetails == null || userDetails.getId() == null || !id.equals(userDetails.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own account.");
        }

        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
