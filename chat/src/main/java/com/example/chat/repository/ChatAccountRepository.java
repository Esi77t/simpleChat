package com.example.chat.repository;

import com.example.chat.model.ChatAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatAccountRepository extends JpaRepository<ChatAccount, String> {
}
