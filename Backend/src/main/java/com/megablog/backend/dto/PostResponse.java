package com.megablog.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;

    @JsonProperty("$id")
    private String appwriteId; // Maps to slug for frontend lookup compatibility (post.$id)

    private String title;

    private String slug;

    private String content;

    private String featuredImage;

    private String status;

    private String category;

    private String userId; // maps to author ID string

    private String userid; // lowercase fallback for React components

    private String authorName;

    private String authorEmail;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
