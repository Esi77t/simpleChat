package com.web.chatbackend.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 이력 엔티티
 * MessageEntity : 메시지 내용, 보낸 사용자 ID, 시간 등을 저장
 */
@Entity
@Table(name = "messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    // 내부 Primary Key

    @Column(nullable = false)
    private Long roomId;    // 메시지가 속한 채팅방 ID (Room 엔티티의 ID를 FK로 참조)

    @Column(nullable = false)
    private Long senderId;  // 메시지를 보낸 사용자 ID (User 엔티티의 ID를 FK로 참조)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 메시지 내용

    @Column(nullable = false)
    private LocalDateTime timestamp;    // 메시지 전송 시간

    // Builder Pattern Constructor (객체 생성에만 사용)
    @Builder
    public Message(Long roomId, Long senderId, String content) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.content = content;
    }

    // JPA Lifecycle Callback
    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
