package com.fittrack.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.dto.AuthResponseDTO;
import com.fittrack.dto.LoginRequestDTO;
import com.fittrack.dto.RegisterRequestDTO;
import com.fittrack.dto.UserResponseDTO;
import com.fittrack.entity.AuthProvider;
import com.fittrack.entity.Role;
import com.fittrack.entity.RoleType;
import com.fittrack.entity.User;
import com.fittrack.repository.RoleRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.security.JwtUtil;
import com.fittrack.util.DuplicateEmailException;
import com.fittrack.util.GoogleTokenVerifier;
import com.fittrack.util.UnauthorizedException;
import com.fittrack.util.UserMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

@Service
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            EmailService emailService,
            GoogleTokenVerifier googleTokenVerifier
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @Transactional
    public UserResponseDTO register(RegisterRequestDTO request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        String normalizedRole = request.role().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("Email already exists");
        }

        Role requestedRole = resolveRole(normalizedRole);

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(requestedRole);
        user.setAuthProvider(AuthProvider.LOCAL);

        User savedUser = userRepository.save(user);
        sendWelcomeEmailSafely(savedUser);

        return UserMapper.toUserResponse(savedUser);
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );

            String token = jwtUtil.createToken(authentication);
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

            return new AuthResponseDTO(token, UserMapper.toUserResponse(user));
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid credentials");
        }
    }

    @Transactional
    public AuthResponseDTO loginWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Google account email is missing");
        }

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> createGoogleUser(normalizedEmail, (String) payload.get("name")));

        String token = jwtUtil.createTokenFromEmail(user.getEmail());
        return new AuthResponseDTO(token, UserMapper.toUserResponse(user));
    }

    private User createGoogleUser(String email, String name) {
        Role defaultRole = ensureRole(RoleType.ROLE_USER);

        User user = new User();
        user.setEmail(email);
        user.setName((name == null || name.isBlank()) ? "Google User" : name.trim());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(defaultRole);
        user.setAuthProvider(AuthProvider.GOOGLE);

        User savedUser = userRepository.save(user);
        sendWelcomeEmailSafely(savedUser);
        return savedUser;
    }

    private void sendWelcomeEmailSafely(User user) {
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        } catch (Exception ex) {
            LOGGER.warn("Welcome email skipped for {} due to mail configuration/runtime issue", user.getEmail());
        }
    }

    private Role ensureRole(RoleType roleType) {
        return roleRepository.findByName(roleType)
                .orElseGet(() -> roleRepository.save(new Role(roleType)));
    }

    private Role resolveRole(String normalizedRole) {
        boolean isAdmin = "admin".equals(normalizedRole);
        RoleType primary = isAdmin ? RoleType.ROLE_ADMIN : RoleType.ROLE_USER;
        RoleType fallback = isAdmin ? RoleType.ADMIN : RoleType.USER;

        return roleRepository.findByName(primary)
                .or(() -> roleRepository.findByName(fallback))
                .orElseGet(() -> createRoleWithFallback(primary, fallback));
    }

    private Role createRoleWithFallback(RoleType primary, RoleType fallback) {
        try {
            return roleRepository.save(new Role(primary));
        } catch (DataIntegrityViolationException ex) {
            return roleRepository.findByName(fallback)
                    .orElseGet(() -> roleRepository.save(new Role(fallback)));
        }
    }
}
