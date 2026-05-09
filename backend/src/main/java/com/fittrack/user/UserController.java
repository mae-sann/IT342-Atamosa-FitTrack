package com.fittrack.user;

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
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal FittrackUserDetails userDetails) {
        return ResponseEntity.ok(userService.getCurrentUser(userDetails.getUsername()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDTO request,
            @AuthenticationPrincipal FittrackUserDetails userDetails
    ) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
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
