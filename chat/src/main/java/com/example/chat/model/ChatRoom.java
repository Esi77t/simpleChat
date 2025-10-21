package com.example.chat.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
@Table(name="chat_room")
@GenericGenerator(name = "uuid2", strategy = "uuid2")
public class ChatRoom {
    @Id
    @GeneratedValue(generator = "uuid2")
    private String roomId;  // 채팅방 고유 ID

    @Column
    private String roomName;    // 채팅방 이름
    private String roomPassword;    // 채팅방 비밀번호(없으면 바로 들어갈 수 있게)

    @Transient
    private List<String> participantIds;    // 채팅방 참여자 목록

    @Column(nullable = false)
    private String ownerId;  // 방장

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime lastMessageSentAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type;
}
