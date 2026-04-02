package com.fittrack.service;

import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fittrack.dto.AuthResponseDTO;
import com.fittrack.dto.ChangePasswordRequestDTO;
import com.fittrack.dto.LoginRequestDTO;
import com.fittrack.dto.OAuthLoginResponseDTO;
import com.fittrack.dto.RegisterRequestDTO;
import com.fittrack.dto.UserResponseDTO;
import com.fittrack.entity.AuthProvider;
import com.fittrack.entity.Role;
import com.fittrack.entity.RoleType;
import com.fittrack.entity.User;
import com.fittrack.repository.RoleRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.util.DuplicateEmailException;
import com.fittrack.util.GoogleTokenVerifier;
import com.fittrack.util.UnauthorizedException;
import com.fittrack.util.UserMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

@Service
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);
    private static final String DEFAULT_GOOGLE_USER_NAME = "Google User";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            EmailService emailService,
            GoogleTokenVerifier googleTokenVerifier
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @Transactional
    public UserResponseDTO register(RegisterRequestDTO request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("Email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(resolveRole(request.role()));
        user.setRoleEntity(resolveLegacyRoleEntity(user.getRole()));
        user.setProvider(AuthProvider.LOCAL);

        User savedUser = userRepository.save(user);
        sendWelcomeEmailSafely(savedUser);

        return UserMapper.toUserResponse(savedUser);
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );

                String token = jwtService.generateToken(authentication);
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

            return new AuthResponseDTO(token, UserMapper.toUserResponse(user));
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid credentials");
        }
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (user.getProvider() == AuthProvider.GOOGLE) {
            throw new UnauthorizedException("Password management is not available for Google accounts");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public AuthResponseDTO loginWithGoogle(String idToken) {
        OAuthLoginResponseDTO oauthResponse = loginWithGoogleTokenResponse(idToken);
        User user = userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, oauthResponse.provider_id())
            .orElseThrow(() -> new UnauthorizedException("Google user not found after login"));
        return new AuthResponseDTO(oauthResponse.token(), UserMapper.toUserResponse(user));
        }

        @Transactional
        public OAuthLoginResponseDTO loginWithGoogleTokenResponse(String idToken) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);

        User user = upsertGoogleUser(Map.of(
                "sub", payload.getSubject(),
                "email", payload.getEmail(),
                "name", payload.get("name"),
                "given_name", payload.get("given_name"),
                "family_name", payload.get("family_name")
        ));

        String token = jwtService.generateToken(user);
        return toOAuthResponse(token, user);
    }

    @Transactional
    public AuthResponseDTO loginWithGoogleProfile(Map<String, Object> attributes) {
        OAuthLoginResponseDTO oauthResponse = loginWithGoogleProfileResponse(attributes);
        User user = userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, oauthResponse.provider_id())
                .orElseThrow(() -> new UnauthorizedException("Google user not found after login"));
        return new AuthResponseDTO(oauthResponse.token(), UserMapper.toUserResponse(user));
    }

    @Transactional
    public OAuthLoginResponseDTO loginWithGoogleProfileResponse(Map<String, Object> attributes) {
        User user = upsertGoogleUser(attributes);
        String token = jwtService.generateToken(user);
        return toOAuthResponse(token, user);
    }

    private void sendWelcomeEmailSafely(User user) {
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        } catch (Exception ex) {
            LOGGER.warn("Welcome email skipped for {} due to mail configuration/runtime issue", user.getEmail());
        }
    }

    private User upsertGoogleUser(Map<String, Object> attributes) {
        String email = getAttribute(attributes, "email");
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Google account email is missing");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String providerId = getAttribute(attributes, "sub");
        String givenName = firstNonBlank(
                getAttribute(attributes, "given_name"),
                extractFirstName(getAttribute(attributes, "name"))
        );
        String familyName = firstNonBlank(
                getAttribute(attributes, "family_name"),
                extractLastName(getAttribute(attributes, "name"))
        );

        if (providerId != null && !providerId.isBlank()) {
            return userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, providerId)
                    .map(existingGoogleUser -> touchGoogleUser(existingGoogleUser, givenName, familyName, normalizedEmail))
                    .orElseGet(() -> userRepository.findByEmail(normalizedEmail)
                            .map(existingEmailUser -> linkGoogleAccount(existingEmailUser, providerId, givenName, familyName))
                            .orElseGet(() -> createGoogleUser(normalizedEmail, providerId, givenName, familyName)));
        }

        return userRepository.findByEmail(normalizedEmail)
                .map(existingUser -> linkGoogleAccount(existingUser, providerId, givenName, familyName))
                .orElseGet(() -> createGoogleUser(normalizedEmail, providerId, givenName, familyName));
    }

    private User touchGoogleUser(User existingGoogleUser, String givenName, String familyName, String email) {
        if (existingGoogleUser.getFirstName() == null || existingGoogleUser.getFirstName().isBlank()) {
            existingGoogleUser.setFirstName(firstNonBlank(givenName, "Google"));
        }
        if (existingGoogleUser.getLastName() == null || existingGoogleUser.getLastName().isBlank()) {
            existingGoogleUser.setLastName(firstNonBlank(familyName, "User"));
        }
        if (existingGoogleUser.getEmail() == null || existingGoogleUser.getEmail().isBlank()) {
            existingGoogleUser.setEmail(email);
        }
        existingGoogleUser.setProvider(AuthProvider.GOOGLE);
        existingGoogleUser.setEnabled(true);
        if (existingGoogleUser.getRoleEntity() == null) {
            existingGoogleUser.setRoleEntity(resolveLegacyRoleEntity(existingGoogleUser.getRole()));
        }
        return userRepository.save(existingGoogleUser);
    }

    private User linkGoogleAccount(User existingUser, String providerId, String givenName, String familyName) {
        existingUser.setProvider(AuthProvider.GOOGLE);

        if (providerId != null && !providerId.isBlank()) {
            existingUser.setProviderId(providerId);
        }

        if (existingUser.getFirstName() == null || existingUser.getFirstName().isBlank()) {
            existingUser.setFirstName(firstNonBlank(givenName, "Google"));
        }

        if (existingUser.getLastName() == null || existingUser.getLastName().isBlank()) {
            existingUser.setLastName(firstNonBlank(familyName, existingUser.getFirstName()));
        }

        if (existingUser.getRoleEntity() == null) {
            existingUser.setRoleEntity(resolveLegacyRoleEntity(existingUser.getRole()));
        }

        return userRepository.save(existingUser);
    }

    private User createGoogleUser(String email, String providerId, String givenName, String familyName) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstNonBlank(givenName, "Google"));
        user.setLastName(firstNonBlank(familyName, "User"));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(RoleType.USER);
        user.setRoleEntity(resolveLegacyRoleEntity(RoleType.USER));
        user.setProvider(AuthProvider.GOOGLE);
        user.setProviderId(firstNonBlank(providerId, UUID.randomUUID().toString()));

        User savedUser = userRepository.save(user);
        sendWelcomeEmailSafely(savedUser);
        return savedUser;
    }

    private RoleType resolveRole(String rawRole) {
        return "admin".equalsIgnoreCase(rawRole) ? RoleType.ADMIN : RoleType.USER;
    }

    private Role resolveLegacyRoleEntity(RoleType roleType) {
        RoleType legacyRoleType = roleType == RoleType.ADMIN || roleType == RoleType.ROLE_ADMIN
                ? RoleType.ROLE_ADMIN
                : RoleType.ROLE_USER;

        return roleRepository.findByName(legacyRoleType)
                .orElseGet(() -> roleRepository.save(new Role(legacyRoleType)));
    }

    private String getAttribute(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private String extractFirstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return DEFAULT_GOOGLE_USER_NAME;
        }
        return fullName.trim().split("\\s+")[0];
    }

    private String extractLastName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "User";
        }

        String[] parts = fullName.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : parts[0];
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary.trim();
        }
        return fallback;
    }

    private OAuthLoginResponseDTO toOAuthResponse(String token, User user) {
        String normalizedRole = user.getRole() == RoleType.ADMIN || user.getRole() == RoleType.ROLE_ADMIN
                ? "ADMIN"
                : "USER";

        return new OAuthLoginResponseDTO(
                token,
                AuthProvider.GOOGLE.name(),
                user.getProviderId(),
                normalizedRole
        );
    }
}
