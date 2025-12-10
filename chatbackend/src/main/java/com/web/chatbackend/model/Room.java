package com.web.chatbackend.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 채팅방 정보 엔티티
 * RoomEntity : 방 이름, 생성자 ID 등을 저장
 */
@Entity
@Table(name = "rooms")
@Getter // 읽기만 허용
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA를 위한 기본 생성자 (접근 레벨은 보호)
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;    // 채팅방 이름

    @Column(nullable = false)
    private Long creatorId; // 방을 만든 사용자의 ID (User 엔티티의 ID를 FK로 참조)

    @Column(length = 255)   // 비밀번호는 필수가 아님
    private String password;    // 비공개방을 위한 비밀번호 (반드시 해시되어 저장)

    @Column(nullable = false)
    private LocalDateTime createdAt;    // 채팅방 생성일

    @Builder
    public Room(String name, Long creatorId, String password) {
        this.name = name;
        this.creatorId = creatorId;
        this.password = password;
    }

    // 명시적인 상태 변경 메서드 (방 이름 변경할 때)
    /**
     * 방이름을 변경하는 메서드
     * @param newName 새로운 방 이름
     */
    public void updateName(String newName) {
        this.name = newName;
    }

    /**
     * 방 비밀번호를 변경하거나 설정하는 메서드
     * 공개방 전환 시에는 null을 전달할 수 있음
     * @param newPassword 새로 해시된 비밀번호 (공개방 전환 시 null 허용)
     */
    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
