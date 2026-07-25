package com.megablog.backend.controller;

import com.megablog.backend.dto.PostResponse;
import com.megablog.backend.entity.Bookmark;
import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import com.megablog.backend.repository.BookmarkRepository;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@Tag(name = "Bookmarks Management", description = "Endpoints for bookmarking posts and viewing bookmarks")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BookmarkController {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null;
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

    private PostResponse convertToPostResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .appwriteId(post.getSlug())
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(post.getContent())
                .featuredImage(post.getFeaturedImage())
                .status(post.getStatus())
                .category(post.getCategory())
                .userId(String.valueOf(post.getUser().getId()))
                .userid(String.valueOf(post.getUser().getId()))
                .authorName(post.getUser().getName())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    @PostMapping("/api/posts/{slugOrId}/bookmark")
    @Operation(summary = "Toggle bookmark/unbookmark status for a post")
    public ResponseEntity<?> toggleBookmark(@PathVariable String slugOrId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Authentication is required to bookmark a post");
            return ResponseEntity.status(401).body(err);
        }

        Post post = getPostBySlugOrId(slugOrId);
        Optional<Bookmark> existingBookmark = bookmarkRepository.findByUserAndPost(user, post);

        boolean bookmarked;
        if (existingBookmark.isPresent()) {
            bookmarkRepository.delete(existingBookmark.get());
            bookmarked = false;
        } else {
            Bookmark bookmark = Bookmark.builder()
                    .user(user)
                    .post(post)
                    .build();
            bookmarkRepository.save(bookmark);
            bookmarked = true;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bookmarked", bookmarked);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/posts/{slugOrId}/bookmark-status")
    @Operation(summary = "Check if post is bookmarked by logged in user")
    public ResponseEntity<?> getBookmarkStatus(@PathVariable String slugOrId) {
        Post post = getPostBySlugOrId(slugOrId);
        User user = getAuthenticatedUser();

        boolean bookmarked = false;
        if (user != null) {
            bookmarked = bookmarkRepository.existsByUserAndPost(user, post);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bookmarked", bookmarked);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/bookmarks")
    @Operation(summary = "List all bookmarked posts of the authenticated user")
    public ResponseEntity<?> getUserBookmarks() {
        User user = getAuthenticatedUser();
        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Authentication is required to view bookmarks");
            return ResponseEntity.status(401).body(err);
        }

        List<Bookmark> bookmarks = bookmarkRepository.findByUserOrderByCreatedAtDesc(user);
        List<PostResponse> postResponses = bookmarks.stream()
                .map(Bookmark::getPost)
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("documents", postResponses);
        response.put("total", postResponses.size());

        return ResponseEntity.ok(response);
    }
}
