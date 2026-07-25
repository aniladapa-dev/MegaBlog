package com.megablog.backend.controller;

import com.megablog.backend.dto.PostRequest;
import com.megablog.backend.dto.PostResponse;
import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import com.megablog.backend.repository.PostRepository;
import com.megablog.backend.repository.UserRepository;
import com.megablog.backend.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Post Management", description = "Endpoints for creating, reading, updating, and deleting posts")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("Unauthorized");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Post getPostBySlugOrId(String slugOrId) {
        try {
            Long id = Long.parseLong(slugOrId);
            return postRepository.findById(id)
                    .or(() -> postRepository.findBySlug(slugOrId))
                    .orElseThrow(() -> new RuntimeException("Post not found with id/slug: " + slugOrId));
        } catch (NumberFormatException e) {
            return postRepository.findBySlug(slugOrId)
                    .orElseThrow(() -> new RuntimeException("Post not found with slug: " + slugOrId));
        }
    }

    private PostResponse convertToPostResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .appwriteId(post.getSlug()) // maps to slug for compatibility
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(post.getContent())
                .featuredImage(post.getFeaturedImage())
                .status(post.getStatus())
                .category(post.getCategory())
                .userId(String.valueOf(post.getUser().getId()))
                .userid(String.valueOf(post.getUser().getId()))
                .authorName(post.getUser().getName())
                .authorEmail(post.getUser().getEmail())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    @PostMapping
    @Operation(summary = "Create a new blog post")
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        User user = getAuthenticatedUser();

        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = request.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        }
        
        String originalSlug = slug;
        int count = 1;
        while (postRepository.findBySlug(slug).isPresent()) {
            slug = originalSlug + "-" + count++;
        }

        Post post = Post.builder()
                .title(request.getTitle())
                .slug(slug)
                .content(request.getContent())
                .featuredImage(request.getFeaturedImage())
                .status(request.getStatus())
                .category(request.getCategory())
                .user(user)
                .build();

        Post savedPost = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToPostResponse(savedPost));
    }

    @PutMapping("/{slugOrId}")
    @Operation(summary = "Update an existing blog post")
    public ResponseEntity<?> updatePost(@PathVariable String slugOrId, @Valid @RequestBody PostRequest request) {
        User user = getAuthenticatedUser();
        Post post = getPostBySlugOrId(slugOrId);

        // Check ownership
        if (!post.getUser().getId().equals(user.getId())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "You are not authorized to update this post");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        // Delete old featured image file if a new one is uploaded
        if (request.getFeaturedImage() != null && !request.getFeaturedImage().equals(post.getFeaturedImage())) {
            fileStorageService.deleteFile(post.getFeaturedImage());
        }

        post.setTitle(request.getTitle());
        
        String newSlug = request.getSlug();
        if (newSlug != null && !newSlug.trim().isEmpty() && !newSlug.equals(post.getSlug())) {
            String originalSlug = newSlug;
            int count = 1;
            while (postRepository.findBySlug(newSlug).filter(p -> !p.getId().equals(post.getId())).isPresent()) {
                newSlug = originalSlug + "-" + count++;
            }
            post.setSlug(newSlug);
        }

        post.setContent(request.getContent());
        post.setFeaturedImage(request.getFeaturedImage());
        post.setStatus(request.getStatus());
        post.setCategory(request.getCategory());

        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(convertToPostResponse(updatedPost));
    }

    @DeleteMapping("/{slugOrId}")
    @Operation(summary = "Delete a blog post")
    public ResponseEntity<?> deletePost(@PathVariable String slugOrId) {
        User user = getAuthenticatedUser();
        Post post = getPostBySlugOrId(slugOrId);

        // Check ownership
        if (!post.getUser().getId().equals(user.getId())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "You are not authorized to delete this post");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        // Delete featured image file from disk
        if (post.getFeaturedImage() != null) {
            fileStorageService.deleteFile(post.getFeaturedImage());
        }

        postRepository.delete(post);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Post deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slugOrId}")
    @Operation(summary = "Get blog post by ID or slug")
    public ResponseEntity<PostResponse> getPost(@PathVariable String slugOrId) {
        Post post = getPostBySlugOrId(slugOrId);
        return ResponseEntity.ok(convertToPostResponse(post));
    }

    @GetMapping
    @Operation(summary = "List all active posts with optional category and keyword search filters")
    public ResponseEntity<Map<String, Object>> getPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<Post> posts = postRepository.findActivePosts(
                (category == null || category.trim().isEmpty()) ? null : category,
                (search == null || search.trim().isEmpty()) ? null : search
        );

        List<PostResponse> postResponses = posts.stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("documents", postResponses);
        response.put("total", postResponses.size());

        return ResponseEntity.ok(response);
    }
}
