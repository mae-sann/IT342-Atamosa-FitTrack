package com.fittrack.dto;

public record UserResponseDTO(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role
) {
}
