package com.web.chatbackend.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// 사용자 정보 엔티티
// 사용자 ID, 비밀번호(해시됨), 닉네임 등을 저장
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA를 위한 기본 생성자(접근 레벨은 보호)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    // 내부적으로 사용할 primary key

    @Column(unique = true, nullable = false, length = 50)
    private String userId;  // 실제 로그인에 사용할 사용자ID

    @Column(nullable = false)
    private String password;    // 암호화된 비밀번호

    @Column(nullable = false, length = 50)
    private String nickname;        // 채팅에서 사용할 닉네임

    @Column(nullable = false)
    private LocalDateTime createdAt;    // 계정 생성일

    @Builder
    public User(String userId, String password, String nickname) {
        this.userId = userId;
        this.password = password;
        this.nickname = nickname;
    }

    // 명시적인 상태 변경 메서드 (비즈니스 로직에서 제어함)
    /**
     * 비밀번호를 안전하게 업데이트 하는 메서드
     * @param newPassword 새로 해시된 패스워드
     */
    public void updatePassword(String newPassword) {
        this.password = newPassword;
    }

    /**
     * 닉네임을 변경하는 메서드
     * @param newNickname 새로운 닉네임
     */
    public void updateNickname(String newNickname) {
        this.nickname = newNickname;
    }

    // JPA Lifecycle Callback
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
