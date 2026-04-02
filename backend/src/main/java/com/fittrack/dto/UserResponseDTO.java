package com.fittrack.dto;

import java.time.LocalDateTime;

public record UserResponseDTO(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role,
        String provider,
        LocalDateTime createdAt
) {
}
