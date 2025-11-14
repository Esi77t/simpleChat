package com.example.chat.repository;

import com.example.chat.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    // 특정 채팅방의 이전 메시지 목록을 시간순(오래된 것부터)으로 조회
    List<ChatMessage> findByRoomIdOrderByTimeStampAsc(String roomId);
}
