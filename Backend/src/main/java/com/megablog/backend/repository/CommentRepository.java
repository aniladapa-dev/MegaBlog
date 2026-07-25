package com.megablog.backend.repository;

import com.megablog.backend.entity.Comment;
import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);
    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Comment c WHERE c.user = :user")
    void deleteByUser(@org.springframework.data.repository.query.Param("user") User user);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Comment c WHERE c.post = :post")
    void deleteByPost(@org.springframework.data.repository.query.Param("post") Post post);
}
