package com.example.chat.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Entity
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@GenericGenerator(name = "uuid2", strategy = "uuid2")
public class ChatAccount {
    @Id
    @GeneratedValue(generator = "uuid2")
    private String accountId;   // 자동생성되는 고유계정(유저에겐 안보임)

    @Column(unique = true, nullable = false)
    private String userId;      // 유저 계정
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String nickname;    // 유저 닉네임

    @CreatedDate
    private LocalDateTime createdAt;    // 계정 생성 시간

    @LastModifiedDate
    private LocalDateTime updatedAt;    // 계정 수정 시간
}
