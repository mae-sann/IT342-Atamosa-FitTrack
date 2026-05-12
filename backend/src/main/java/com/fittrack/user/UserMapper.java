package com.fittrack.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fittrack.shared.entity.User;

public final class UserMapper {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(UserMapper.class);

    private UserMapper() {
    }

    public static UserResponseDTO toUserResponse(User user) {
        if (user == null) {
            LOGGER.error("Cannot map null user to UserResponseDTO");
            throw new IllegalArgumentException("User cannot be null");
        }
        
        if (user.getRole() == null) {
            LOGGER.error("User role is null for user: {} (ID: {})", user.getEmail(), user.getId());
            throw new IllegalArgumentException("User role cannot be null");
        }
        
        String roleString = user.getRole().name().replace("ROLE_", "");
        String providerString = user.getProvider() != null ? user.getProvider().name() : "UNKNOWN";
        
        LOGGER.debug("Mapping user to response: {} (role: {}, provider: {})", user.getEmail(), roleString, providerString);
        
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roleString,
                providerString,
                user.getCreatedAt()
        );
    }
}
