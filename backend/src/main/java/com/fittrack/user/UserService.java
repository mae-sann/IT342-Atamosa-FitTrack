package com.fittrack.user;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.user.UpdateProfileRequestDTO;
import com.fittrack.user.UserResponseDTO;
import com.fittrack.shared.entity.User;
import com.fittrack.user.UserRepository;
import com.fittrack.shared.exception.ResourceNotFoundException;
import com.fittrack.user.UserMapper;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
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
