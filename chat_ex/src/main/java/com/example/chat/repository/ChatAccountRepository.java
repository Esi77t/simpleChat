package com.example.chat.repository;

import com.example.chat.model.ChatAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatAccountRepository extends JpaRepository<ChatAccount, String> {
    Optional<ChatAccount> findByUserId(String userId);
    boolean existsByNickname(String nickname);
    boolean existsByUserId(String userId);
}
