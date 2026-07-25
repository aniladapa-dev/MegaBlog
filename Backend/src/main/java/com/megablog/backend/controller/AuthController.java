package com.megablog.backend.controller;

import com.megablog.backend.dto.*;
import com.megablog.backend.entity.User;
import com.megablog.backend.repository.UserRepository;
import com.megablog.backend.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "User Authentication", description = "Endpoints for user registration, login, and profile retrieval")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private com.megablog.backend.repository.PostRepository postRepository;

    @Autowired
    private com.megablog.backend.repository.CommentRepository commentRepository;

    @Autowired
    private com.megablog.backend.repository.BookmarkRepository bookmarkRepository;

    @Autowired
    private com.megablog.backend.repository.LikeRepository likeRepository;

    @PostMapping("/signup")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Email address is already in use!");
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }

        // Creating user's account
        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role("ROLE_USER")
                .provider("LOCAL")
                .build();

        userRepository.save(user);

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signupRequest.getEmail(),
                        signupRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(jwt, "Bearer", convertToUserResponse(user)));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and generate JWT token")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        return ResponseEntity.ok(new AuthResponse(jwt, "Bearer", convertToUserResponse(user)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user details")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for active session"));

        return ResponseEntity.ok(convertToUserResponse(user));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user public profile details by ID")
    public ResponseEntity<?> getUserPublicProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(convertToUserResponse(user));
    }

    @GetMapping("/users/search")
    @Operation(summary = "Search registered users by name or email")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        if (query == null || query.trim().isBlank()) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        java.util.List<User> users = userRepository.searchUsers(query.trim());
        java.util.List<UserResponse> responses = users.stream()
                .map(this::convertToUserResponse)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/update-profile")
    @Operation(summary = "Update current user profile name and password")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("name") && request.get("name") != null && !request.get("name").isBlank()) {
            user.setName(request.get("name").trim());
        }

        if (request.containsKey("password") && request.get("password") != null && !request.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(request.get("password")));
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(convertToUserResponse(updated));
    }

    @DeleteMapping("/delete-account")
    @org.springframework.transaction.annotation.Transactional
    @Operation(summary = "Delete current authenticated user account and all associated data")
    public ResponseEntity<?> deleteAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Fetch all posts owned by this user
        java.util.List<com.megablog.backend.entity.Post> posts = postRepository.findByUser(user);

        // 2. Delete all comments, bookmarks, and likes associated with the user's posts
        for (com.megablog.backend.entity.Post post : posts) {
            commentRepository.deleteByPost(post);
            bookmarkRepository.deleteByPost(post);
            likeRepository.deleteByPost(post);
        }

        // 3. Delete all comments, bookmarks, and likes created by this user on other posts
        commentRepository.deleteByUser(user);
        bookmarkRepository.deleteByUser(user);
        likeRepository.deleteByUser(user);

        // 4. Delete all posts owned by this user
        postRepository.deleteByUser(user);

        // 5. Delete the user
        userRepository.delete(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Account and all associated data deleted successfully!");
        return ResponseEntity.ok(response);
    }

    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .appwriteId(String.valueOf(user.getId())) // Set $id compatibility
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .provider(user.getProvider())
                .build();
    }
}
