package com.megablog.backend.repository;

import com.megablog.backend.entity.Like;
import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    long countByPost(Post post);
    boolean existsByUserAndPost(User user, Post post);
    Optional<Like> findByUserAndPost(User user, Post post);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Like l WHERE l.user = :user")
    void deleteByUser(@org.springframework.data.repository.query.Param("user") User user);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Like l WHERE l.post = :post")
    void deleteByPost(@org.springframework.data.repository.query.Param("post") Post post);
}
