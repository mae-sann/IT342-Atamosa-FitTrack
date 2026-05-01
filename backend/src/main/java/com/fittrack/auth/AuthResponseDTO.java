package com.fittrack.auth;

import com.fittrack.user.UserResponseDTO;

public record AuthResponseDTO(
        String token,
        UserResponseDTO user
) {
}
