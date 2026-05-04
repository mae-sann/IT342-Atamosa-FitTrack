package com.fittrack.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fittrack.auth.AuthResponseDTO;
import com.fittrack.user.ChangePasswordRequestDTO;
import com.fittrack.auth.GoogleOAuthRequestDTO;
import com.fittrack.auth.LoginRequestDTO;
import com.fittrack.auth.OAuthLoginResponseDTO;
import com.fittrack.auth.RegisterRequestDTO;
import com.fittrack.user.UserResponseDTO;
import com.fittrack.auth.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/oauth/google")
    public ResponseEntity<Map<String, String>> googleLoginUrl() {
        return ResponseEntity.ok(Map.of(
                "authorizationUrl", "/oauth2/authorization/google"
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequestDTO request) {
        UserResponseDTO user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "User registered successfully",
                        "user", user
                ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<OAuthLoginResponseDTO> loginWithGoogle(@Valid @RequestBody GoogleOAuthRequestDTO request) {
        return ResponseEntity.ok(authService.loginWithGoogleTokenResponse(request.idToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logout successful. Remove JWT token on client side."));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
