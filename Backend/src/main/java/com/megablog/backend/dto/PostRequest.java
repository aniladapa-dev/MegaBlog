package com.megablog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Content is required")
    private String content;

    private String featuredImage;

    @NotBlank(message = "Status is required")
    private String status; // active or inactive

    private String category; // comedy, action, thriller, motivation, etc.
}
