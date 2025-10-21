package com.example.chat.DTO;

import com.example.chat.model.MessageType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageDTO {
    private String messageId;
    private MessageType type;
    private String roomId;
    private String senderId;
    private String senderNickname;
    private String message;
    private LocalDateTime timeStamp;
    private int readCount;
}
