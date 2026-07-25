package com.megablog.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // Password will be null for OAuth2 users
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String provider; // e.g., LOCAL, GOOGLE

    private String providerId; // Google's user ID

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (role == null) {
            role = "ROLE_USER";
        }
        if (provider == null) {
            provider = "LOCAL";
        }
    }
}
