package com.fittrack.user;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.shared.entity.User;
import com.fittrack.shared.exception.ResourceNotFoundException;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUser(String email) {
        logger.debug("Fetching user with email: {}", email);
        
        if (email == null || email.isEmpty()) {
            throw new ResourceNotFoundException("Email is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("User not found with email: {}", email);
                    return new ResourceNotFoundException("User with email '" + email + "' not found in database");
                });
        
        logger.debug("User found: {} ({})", user.getEmail(), user.getId());
        return UserMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toUserResponse)
                .toList();
    }

    @Transactional
    public UserResponseDTO updateProfile(String email, UpdateProfileRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());

        User savedUser = userRepository.save(user);
        return UserMapper.toUserResponse(savedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }
}
