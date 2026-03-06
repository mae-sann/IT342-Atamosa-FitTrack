package edu.cit.atamosa.fittrack.controller;

import edu.cit.atamosa.fittrack.dto.AuthResponse;
import edu.cit.atamosa.fittrack.dto.LoginRequest;
import edu.cit.atamosa.fittrack.dto.RegisterRequest;
import edu.cit.atamosa.fittrack.model.User;
import edu.cit.atamosa.fittrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Register a new user
     * Expected request body from frontend:
     * {
     *   "firstName": "Charry",
     *   "lastName": "Atamosa", 
     *   "email": "test@example.com",
     *   "password": "password123",
     *   "role": "ROLE_USER" or "ROLE_ADMIN"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if email already exists
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email already exists");
                response.put("error", error);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Create new user
            User user = new User();
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setEmail(registerRequest.getEmail().toLowerCase().trim());
            user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
            
            // Handle role (frontend sends "ROLE_USER" or "ROLE_ADMIN")
            String role = registerRequest.getRole();
            if (role == null || role.isEmpty()) {
                user.setRole("USER");
            } else if (role.equals("ROLE_ADMIN")) {
                user.setRole("ADMIN");
            } else {
                user.setRole("USER");
            }

            userRepository.save(user);
            
            // Generate temporary tokens (for Phase 1 - will be replaced with JWT in Phase 2)
            String accessToken = UUID.randomUUID().toString();
            String refreshToken = UUID.randomUUID().toString();
            
            // Create user data object matching frontend expectation
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            userData.put("email", user.getEmail());
            userData.put("role", "ROLE_" + user.getRole()); // Send ROLE_ format to frontend
            
            // Create response matching frontend AuthResponse structure
            Map<String, Object> data = new HashMap<>();
            data.put("accessToken", accessToken);
            data.put("refreshToken", refreshToken);
            data.put("user", userData);
            
            response.put("data", data);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed: " + e.getMessage());
            response.put("error", error);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Login user
     * Expected request body:
     * {
     *   "email": "test@example.com",
     *   "password": "password123"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Find user by email
            User user = userRepository.findByEmail(loginRequest.getEmail().toLowerCase().trim()).orElse(null);
            
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid email or password");
                response.put("error", error);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Check password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid email or password");
                response.put("error", error);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // Generate temporary tokens (for Phase 1 - will be replaced with JWT in Phase 2)
            String accessToken = UUID.randomUUID().toString();
            String refreshToken = UUID.randomUUID().toString();
            
            // Create user data object matching frontend expectation
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            userData.put("email", user.getEmail());
            userData.put("role", "ROLE_" + user.getRole()); // Send ROLE_ format to frontend
            
            // Create response matching frontend AuthResponse structure
            Map<String, Object> data = new HashMap<>();
            data.put("accessToken", accessToken);
            data.put("refreshToken", refreshToken);
            data.put("user", userData);
            
            response.put("data", data);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed: " + e.getMessage());
            response.put("error", error);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get current authenticated user
     * Expected header: Authorization: Bearer <token>
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // For Phase 1, we'll just return a placeholder
            // In Phase 2, this will validate JWT token
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Not authenticated");
                response.put("error", error);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            // For Phase 1, we can't really get user from token
            // Return a generic response for now
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", 1);
            userData.put("firstName", "Test");
            userData.put("lastName", "User");
            userData.put("email", "test@example.com");
            userData.put("role", "ROLE_USER");
            
            response.put("data", userData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error getting user");
            response.put("error", error);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Logout user
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Map<String, Object> response = new HashMap<>();
        
        // For Phase 1, just return success
        // In Phase 2, this will invalidate the token
        
        Map<String, String> data = new HashMap<>();
        data.put("message", "Logged out successfully");
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }
}