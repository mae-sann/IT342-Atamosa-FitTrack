package com.fittrack.admin;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fittrack.shared.entity.Role;
import com.fittrack.shared.entity.RoleType;
import com.fittrack.shared.entity.User;
import com.fittrack.user.RoleRepository;
import com.fittrack.user.UserRepository;
import com.fittrack.workout.WorkoutRepository;
import com.fittrack.shared.exception.ResourceNotFoundException;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WorkoutRepository workoutRepository;

    public AdminUserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            WorkoutRepository workoutRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.workoutRepository = workoutRepository;
    }

    @Transactional(readOnly = true)
    public AdminUsersPage getUsers(int page, int size, String search) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        String keyword = search == null ? "" : search.trim();
        Page<User> usersPage = keyword.isBlank()
                ? userRepository.findAll(pageable)
                : userRepository.searchForAdmin(keyword, pageable);

        List<Long> userIds = usersPage.getContent().stream()
                .map(User::getId)
                .toList();

        Map<Long, Long> workoutCounts = getWorkoutCounts(userIds);
        Set<Long> activeUserIds = getActiveUserIds(userIds);

        List<AdminUserItem> content = usersPage.getContent().stream()
                .map(user -> new AdminUserItem(
                        user.getId(),
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        normalizeRole(user.getRole()),
                        user.getCreatedAt(),
                        workoutCounts.getOrDefault(user.getId(), 0L),
                        user.isEnabled() && activeUserIds.contains(user.getId())
                ))
                .toList();

        return new AdminUsersPage(content, usersPage.getTotalElements(), usersPage.getTotalPages());
    }

    @Transactional
    public AdminUserItem updateUserRole(Long userId, String requestedRole, String currentUserEmail) {
        String normalizedRequestedRole = normalizeRequestedRole(requestedRole);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase(currentUserEmail) && "USER".equals(normalizedRequestedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot remove your own admin role");
        }

        RoleType legacyRole = "ADMIN".equals(normalizedRequestedRole) ? RoleType.ROLE_ADMIN : RoleType.ROLE_USER;
        RoleType displayRole = "ADMIN".equals(normalizedRequestedRole) ? RoleType.ADMIN : RoleType.USER;

        Role roleEntity = roleRepository.findByName(legacyRole)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        user.setRoleEntity(roleEntity);
        user.setRole(displayRole);

        User saved = userRepository.save(user);

        long workoutCount = workoutRepository.countWorkoutsByUserIds(List.of(saved.getId())).stream()
                .findFirst()
                .map(row -> ((Number) row[1]).longValue())
                .orElse(0L);

        boolean isActive = workoutRepository.findActiveUserIdsSince(
                List.of(saved.getId()),
                LocalDateTime.now().minusDays(7)
        ).contains(saved.getId());

        return new AdminUserItem(
                saved.getId(),
                saved.getEmail(),
                saved.getFirstName(),
                saved.getLastName(),
                normalizeRole(saved.getRole()),
                saved.getCreatedAt(),
                workoutCount,
                saved.isEnabled() && isActive
        );
    }

    @Transactional
    public void deleteUser(Long userId, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account");
        }

        userRepository.delete(user);
    }

    private Map<Long, Long> getWorkoutCounts(List<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : workoutRepository.countWorkoutsByUserIds(userIds)) {
            Long userId = ((Number) row[0]).longValue();
            Long count = ((Number) row[1]).longValue();
            counts.put(userId, count);
        }
        return counts;
    }

    private Set<Long> getActiveUserIds(List<Long> userIds) {
        if (userIds.isEmpty()) {
            return Set.of();
        }

        LocalDateTime activeSince = LocalDateTime.now().minusDays(7);
        return workoutRepository.findActiveUserIdsSince(userIds, activeSince)
                .stream()
                .collect(Collectors.toSet());
    }

    private String normalizeRequestedRole(String role) {
        String value = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
        if (!"ADMIN".equals(value) && !"USER".equals(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be ADMIN or USER");
        }
        return value;
    }

    private String normalizeRole(RoleType roleType) {
        String value = roleType == null ? "USER" : roleType.name();
        return value.contains("ADMIN") ? "ADMIN" : "USER";
    }

    public record AdminUserItem(
            Long id,
            String email,
            String firstName,
            String lastName,
            String role,
            LocalDateTime createdAt,
            Long workoutCount,
            boolean isActive
    ) {
    }

    public record AdminUsersPage(
            List<AdminUserItem> content,
            long totalElements,
            int totalPages
    ) {
    }
}
