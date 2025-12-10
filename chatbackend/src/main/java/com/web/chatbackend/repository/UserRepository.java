package com.web.chatbackend.repository;

import com.web.chatbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 사용자 엔티티에 대한 데이터 접근을 담당
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * 사용자 ID (login ID)를 기준으로 사용자를 조회
     * 인증 로직(로그인, JWT 유효성 검사)에서 필수적으로 사용함
     * @param userId 실제 사용자 로그인 ID (예 : "user123")
     * @return User 객체를 담은 Optional
     */
    Optional<User> findByUserId(String userId);

    /**
     * 사용자 ID의 중복 여부를 확인
     * 회원가입 시 중복 검사에 사용
     * @param userId 실제 사용자 로그인 ID
     * @return 존재하면 true, 아니면 false
     */
    boolean existsByUserId(String userId);
}
