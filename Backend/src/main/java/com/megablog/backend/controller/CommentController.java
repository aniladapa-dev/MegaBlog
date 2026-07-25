package com.megablog.backend.controller;

import com.megablog.backend.dto.CommentRequest;
import com.megablog.backend.dto.CommentResponse;
import com.megablog.backend.entity.Comment;
import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import com.megablog.backend.repository.CommentRepository;
import com.megablog.backend.repository.PostRepository;
import com.megablog.backend.repository.UserRepository;
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
@Tag(name = "Comments Management", description = "Endpoints for posting, retrieving, and deleting comments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

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
                    .orElseThrow(() -> new RuntimeException("Post not found"));
        } catch (NumberFormatException e) {
            return postRepository.findBySlug(slugOrId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
        }
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(String.valueOf(comment.getUser().getId()))
                .userName(comment.getUser().getName())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @PostMapping("/api/posts/{slugOrId}/comments")
    @Operation(summary = "Add a comment to a blog post")
    public ResponseEntity<CommentResponse> addComment(@PathVariable String slugOrId, @Valid @RequestBody CommentRequest request) {
        User user = getAuthenticatedUser();
        Post post = getPostBySlugOrId(slugOrId);

        Comment comment = Comment.builder()
                .user(user)
                .post(post)
                .content(request.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToCommentResponse(savedComment));
    }

    @GetMapping("/api/posts/{slugOrId}/comments")
    @Operation(summary = "List comments of a blog post")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String slugOrId) {
        Post post = getPostBySlugOrId(slugOrId);
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(post.getId());
        List<CommentResponse> responses = comments.stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/api/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        User user = getAuthenticatedUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Only comment author OR post author can delete the comment
        if (!comment.getUser().getId().equals(user.getId()) && !comment.getPost().getUser().getId().equals(user.getId())) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "You are not authorized to delete this comment");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        commentRepository.delete(comment);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Comment deleted successfully");
        return ResponseEntity.ok(response);
    }
}
