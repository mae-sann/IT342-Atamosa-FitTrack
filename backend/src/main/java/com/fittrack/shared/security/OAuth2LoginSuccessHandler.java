package com.fittrack.shared.security;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.fittrack.auth.AuthService;
import com.fittrack.auth.OAuthLoginResponseDTO;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

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
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            LOGGER.info("OAuth2 authentication successful");
            
            Map<String, Object> attributes = oAuth2User.getAttributes();
            LOGGER.debug("OAuth2 attributes: email={}, name={}, given_name={}", 
                attributes.get("email"), 
                attributes.get("name"), 
                attributes.get("given_name"));

            // Process user through AuthService
            OAuthLoginResponseDTO authResponse = authService.loginWithGoogleProfileResponse(attributes);
            LOGGER.info("OAuth response generated with token and provider: {}", authResponse.provider());

            // Build redirect URL with token and user info
            String redirectUrl = UriComponentsBuilder.fromUriString(oauthSuccessRedirectUrl)
                .queryParam("token", authResponse.token())
                .queryParam("provider", authResponse.provider())
                .queryParam("provider_id", authResponse.provider_id())
                .queryParam("role", authResponse.role())
                .build(true)
                .toUriString();

            LOGGER.info("Redirecting to: {}", oauthSuccessRedirectUrl);
            response.sendRedirect(redirectUrl);
            
        } catch (NullPointerException ex) {
            LOGGER.error("Null pointer exception during OAuth2 authentication: {}", ex.getMessage(), ex);
            handleOAuthError(response, "Invalid OAuth2 user data: " + ex.getMessage());
        } catch (Exception ex) {
            LOGGER.error("OAuth2 authentication failed: {}", ex.getMessage(), ex);
            handleOAuthError(response, "OAuth2 authentication failed: " + ex.getMessage());
        }
    }

    private void handleOAuthError(HttpServletResponse response, String errorMessage) throws IOException {
        LOGGER.error("OAuth error: {}", errorMessage);
        String errorUrl = UriComponentsBuilder.fromUriString(oauthSuccessRedirectUrl)
            .queryParam("error", "authentication_failed")
            .queryParam("message", errorMessage)
            .build(true)
            .toUriString();
        response.sendRedirect(errorUrl);
    }
}