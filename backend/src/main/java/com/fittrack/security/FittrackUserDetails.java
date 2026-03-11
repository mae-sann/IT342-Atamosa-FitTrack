package com.fittrack.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fittrack.entity.User;

public class FittrackUserDetails implements UserDetails {

    private final Long id;
    private final String name;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public FittrackUserDetails(Long id, String name, String email, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static FittrackUserDetails fromUser(User user) {
        String roleName = user.getRole().name();
        String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;

        return new FittrackUserDetails(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword() == null ? "" : user.getPassword(),
            List.of(new SimpleGrantedAuthority(authority))
        );
    }

    public Long getId() {
        return id;
    }

    public String getDisplayName() {
        return name;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
