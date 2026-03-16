package com.fittrack.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.fittrack.dto.OAuthLoginResponseDTO;
import com.fittrack.service.AuthService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final String oauthSuccessRedirectUrl;

    public OAuth2LoginSuccessHandler(
            @Lazy AuthService authService,
            @Value("${app.oauth2.success-redirect-url:http://localhost:5173/oauth2/callback}") String oauthSuccessRedirectUrl
    ) {
        this.authService = authService;
        this.oauthSuccessRedirectUrl = oauthSuccessRedirectUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Spring Security finishes the Google handshake, then the backend links or creates the user
        // and returns a first-party JWT that the client can reuse for protected API calls.
        OAuthLoginResponseDTO authResponse = authService.loginWithGoogleProfileResponse(oAuth2User.getAttributes());

        String redirectUrl = UriComponentsBuilder.fromUriString(oauthSuccessRedirectUrl)
            .queryParam("token", authResponse.token())
            .queryParam("provider", authResponse.provider())
            .queryParam("provider_id", authResponse.provider_id())
            .queryParam("role", authResponse.role())
            .build(true)
            .toUriString();

        response.sendRedirect(redirectUrl);
    }
}