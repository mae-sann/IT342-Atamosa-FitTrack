package com.fittrack.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleOAuthRequestDTO(
        @NotBlank(message = "Google ID token is required")
        String idToken
) {
}
