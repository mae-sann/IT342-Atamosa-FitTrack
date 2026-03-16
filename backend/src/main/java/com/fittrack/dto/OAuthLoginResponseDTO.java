package com.fittrack.dto;

public record OAuthLoginResponseDTO(
        String token,
        String provider,
        String provider_id,
        String role
) {
}