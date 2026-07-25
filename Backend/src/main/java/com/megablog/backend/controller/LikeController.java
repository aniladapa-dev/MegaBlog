package com.megablog.backend.controller;

import com.megablog.backend.entity.Like;
import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import com.megablog.backend.repository.LikeRepository;
import com.megablog.backend.repository.PostRepository;
import com.megablog.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts/{slugOrId}")
@Tag(name = "Likes Management", description = "Endpoints for liking posts and checking like status")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LikeController {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null; // Allow anonymous check for GET status (it'll just return liked=false)
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    private Post getPostBySlugOrId(String slugOrId) {
        try {
            Long id = Long.parseLong(slugOrId);
            return postRepository.findById(id)
                    .or(() -> postRepository.findBySlug(slugOrId))
                    .orElseThrow(() -> new RuntimeException("Post not found"));
        } catch (NumberFormatException e) {
            return postRepository.findBySlug(slugOrId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
        }
    }

    @PostMapping("/like")
    @Operation(summary = "Toggle like/unlike status for a post")
    public ResponseEntity<?> toggleLike(@PathVariable String slugOrId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Authentication is required to like a post");
            return ResponseEntity.status(401).body(err);
        }

        Post post = getPostBySlugOrId(slugOrId);
        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);

        boolean liked;
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            liked = false;
        } else {
            Like like = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(like);
            liked = true;
        }

        long likesCount = likeRepository.countByPost(post);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likesCount", likesCount);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/like-status")
    @Operation(summary = "Get like status and total count for a post")
    public ResponseEntity<?> getLikeStatus(@PathVariable String slugOrId) {
        Post post = getPostBySlugOrId(slugOrId);
        User user = getAuthenticatedUser();

        boolean liked = false;
        if (user != null) {
            liked = likeRepository.existsByUserAndPost(user, post);
        }

        long likesCount = likeRepository.countByPost(post);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likesCount", likesCount);

        return ResponseEntity.ok(response);
    }
}
