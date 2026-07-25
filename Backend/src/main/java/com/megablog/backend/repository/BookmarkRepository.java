package com.megablog.backend.repository;

import com.megablog.backend.entity.Bookmark;
import com.megablog.backend.entity.Post;
import com.megablog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    boolean existsByUserAndPost(User user, Post post);
    Optional<Bookmark> findByUserAndPost(User user, Post post);
    List<Bookmark> findByUserOrderByCreatedAtDesc(User user);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Bookmark b WHERE b.user = :user")
    void deleteByUser(@org.springframework.data.repository.query.Param("user") User user);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Bookmark b WHERE b.post = :post")
    void deleteByPost(@org.springframework.data.repository.query.Param("post") Post post);
}
