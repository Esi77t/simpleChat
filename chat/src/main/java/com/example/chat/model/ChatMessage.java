package com.example.chat.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Table(name = "chat_message")
@GenericGenerator(name = "uuid2", strategy = "uuid2")
public class ChatMessage {
    @Id
    @GeneratedValue(generator = "uuid2")
    private String messageId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    @Column(nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String senderId;

    @Lob
    private String message;

    @Column(nullable = false)
    private LocalDateTime timeStamp;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "message_read_status", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "reader_account_id")
    private List<String> readByAccountsIds;
}
