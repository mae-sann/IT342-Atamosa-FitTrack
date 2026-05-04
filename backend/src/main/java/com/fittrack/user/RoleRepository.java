package com.fittrack.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fittrack.shared.entity.Role;
import com.fittrack.shared.entity.RoleType;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
