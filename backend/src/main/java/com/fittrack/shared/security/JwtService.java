package com.fittrack.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.fittrack.shared.entity.User;
import com.fittrack.shared.security.JwtUtil;

@Service
public class JwtService {

    private final JwtUtil jwtUtil;

    public JwtService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public String generateToken(Authentication authentication) {
        return jwtUtil.createToken(authentication);
    }

    public String generateToken(User user) {
        return jwtUtil.createToken(user);
    }
}