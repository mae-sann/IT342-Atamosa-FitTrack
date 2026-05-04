package com.fittrack.user;

import com.fittrack.user.UserResponseDTO;
import com.fittrack.shared.entity.User;

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
