package com.megablog.backend.repository;

import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    Optional<Post> findBySlug(String slug);
    
    List<Post> findByUser(User user);
    
    @Query("SELECT p FROM Post p WHERE p.status = 'active' " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Post> findActivePosts(@Param("category") String category, @Param("search") String search);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Post p WHERE p.user = :user")
    void deleteByUser(@org.springframework.data.repository.query.Param("user") User user);
}
