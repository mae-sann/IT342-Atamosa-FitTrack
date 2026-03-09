package com.fittrack.dto;

public record AuthResponseDTO(
        String token,
        UserResponseDTO user
) {
}
