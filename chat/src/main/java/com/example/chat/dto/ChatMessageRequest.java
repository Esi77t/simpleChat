package com.example.chat.dto;

import com.example.chat.model.MessageType;

public record ChatMessageRequest(
        String roomId,
        String senderId,
        MessageType type,
        String message
) {
}
