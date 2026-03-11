package com.fittrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fittrack.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderId(com.fittrack.entity.AuthProvider provider, String providerId);

    boolean existsByEmail(String email);
}
