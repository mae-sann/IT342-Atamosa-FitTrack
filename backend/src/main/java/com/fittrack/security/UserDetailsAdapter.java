package com.fittrack.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fittrack.entity.User;

public class UserDetailsAdapter implements UserDetails {
    
    private final User user;
    
    public UserDetailsAdapter(User user) {
        this.user = user;
    }
    
    public Long getId() {
        return user.getId();
    }
    
    public String getName() {
        return user.getName();
    }
    
    public String getFirstName() {
        return user.getFirstName();
    }
    
    public String getLastName() {
        return user.getLastName();
    }
    
    @Override
    public String getUsername() {
        // Your User entity uses 'email' as username
        return user.getEmail();
    }
    
    @Override
    public String getPassword() {
        // Your User entity uses 'password'
        return user.getPassword();
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
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
        return user.isEnabled(); 
    }
}