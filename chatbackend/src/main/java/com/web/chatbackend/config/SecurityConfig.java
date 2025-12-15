package com.web.chatbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Spring Security 기본 설정하고 PasswordEncoder 빈 정의
 * JWT 인증하고 권한 설정 등은 이 클래스에서 추가할 예정
 */
@Configuration
public class SecurityConfig {
    /**
     * 비밀번호를 안전하게 암호화하는데 사용되는 BCryptPasswordEncoder를 Bean으로 등록
     * Service 계층(UserService)에서 비밀번호 처리 시 사용
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
