package com.megablog.backend.security;

import com.megablog.backend.entity.User;
import com.megablog.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String sub = oAuth2User.getAttribute("sub"); // Google User ID

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found from OAuth2 provider");
            return;
        }

        // Find or create user
        userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .name(name != null ? name : email.split("@")[0])
                    .email(email)
                    .role("ROLE_USER")
                    .provider("GOOGLE")
                    .providerId(sub)
                    .build();
            return userRepository.save(newUser);
        });

        // Generate JWT token
        String token = tokenProvider.generateToken(email);

        // Redirect to React frontend callback route
        String targetUrl = "http://localhost:5173/oauth2/callback?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
