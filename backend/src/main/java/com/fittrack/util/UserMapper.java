package com.fittrack.util;

import com.fittrack.dto.UserResponseDTO;
import com.fittrack.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponseDTO toUserResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getName().name().replace("ROLE_", "")
        );
    }
}
