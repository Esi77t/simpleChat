package com.example.chat.dto;

import com.example.chat.model.MessageType;

import java.time.LocalDateTime;

// 서버가 클라이언트로 메시지 전송 시 사용하는 DTO
// ChatMessage 엔티티와 달리 필요한 정보만 담음
public record ChatMessageResponse(
        String messageId,
        String roomId,
        String senderId,
        String senderNickname,  // 표시용 닉네임
        MessageType type,
        String message,
        LocalDateTime timeStamp,
        int readCount // 읽은 사람 수
) {
}
