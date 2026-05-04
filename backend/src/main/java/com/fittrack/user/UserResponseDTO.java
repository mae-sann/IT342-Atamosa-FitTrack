package com.fittrack.user;

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
