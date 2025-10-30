package com.example.chat.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    // 인증 객체를 기반으로 JWT 토큰 발행
    public String generateToken(Authentication authentication) {
        // 일단 임시토큰 반환
        // 나중에 생성 로직 구현 예정
        String userId = authentication.getName();
        return "fake-jwt-token-for-user-" + userId;
    }

    // JWT 토큰 유효성 검사
    public boolean validateToken(String authToken) {
        return authToken != null && authToken.startsWith("fake");
    }

    // JWT 토큰에서 사용자 ID 추출
    public String getUserIdFromJWT(String token) {
        // 실제 JWT에서 사용자 ID 추출 로직 구현 예정
        if(token.startsWith("fake-jwt-token-for-user-")) {
            return token.substring("fake-jwt-token-for-user-".length());
        }

        return null;
    }
}
