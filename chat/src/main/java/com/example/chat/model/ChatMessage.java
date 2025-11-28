package com.example.chat.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String messageId;

    private String roomId;
    private String senderId;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    private String message;
    private LocalDateTime createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "message_read_status", joinColumns = @JoinColumn(name = "message_id"))
    private List<String> readByAccountsIds;
}
