package com.fittrack.shared.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.fittrack.shared.entity.Role;
import com.fittrack.shared.entity.RoleType;
import com.fittrack.user.RoleRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        roleRepository.findByName(RoleType.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_USER)));
        roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_ADMIN)));
    }
}
