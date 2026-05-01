package com.fittrack.user;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fittrack.shared.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderId(com.fittrack.shared.entity.AuthProvider provider, String providerId);

    boolean existsByEmail(String email);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
            select u from User u
            where lower(u.firstName) like lower(concat('%', :search, '%'))
               or lower(u.lastName) like lower(concat('%', :search, '%'))
               or lower(u.email) like lower(concat('%', :search, '%'))
            """)
    Page<User> searchForAdmin(@Param("search") String search, Pageable pageable);
}
