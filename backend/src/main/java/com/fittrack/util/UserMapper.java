package com.fittrack.util;

import com.fittrack.dto.UserResponseDTO;
import com.fittrack.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponseDTO toUserResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name().replace("ROLE_", ""),
                user.getProvider().name(),
                user.getCreatedAt()
        );
    }
}
