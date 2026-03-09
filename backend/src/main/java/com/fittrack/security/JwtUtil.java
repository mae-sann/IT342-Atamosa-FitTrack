package com.fittrack.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtUtil(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public String createToken(Authentication authentication) {
        return jwtTokenProvider.generateToken(authentication);
    }

    public String createTokenFromEmail(String email) {
        return jwtTokenProvider.generateTokenFromEmail(email);
    }

    public String extractUsername(String token) {
        return jwtTokenProvider.getUsernameFromToken(token);
    }

    public boolean isValid(String token) {
        return jwtTokenProvider.validateToken(token);
    }
}
