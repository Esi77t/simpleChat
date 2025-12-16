package com.web.chatbackend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

// JWT의 생성, 검증, 정보 추출을 담당하는 곳
@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenExpirationMs;

    // application.yml에서 설정 값 주입
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.access-token-expiration-seconds}") long accessTokenExpirationMs) {
        // base64 디코딩해서 Key 객체 생성
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        // 초 단위를 밀리초 단위로 변환
        this.accessTokenExpirationMs = accessTokenExpirationMs * 1000;
    }

    // 토큰 생성
    /**
     * 사용자 인증 정보를 기반으로 Access Token을 생성
     * @param authentication Spring Security의 Authentication 객체
     * @return 생성된 JWT 문자열
     */
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationMs);

        return Jwts.builder()
                .setSubject(username)   // 토큰 주체
                .setIssuedAt(now)       // 발급 시간
                .setExpiration(expiryDate)      // 만료 시간
                .signWith(key, SignatureAlgorithm.HS256)  // 서명 키와 알고리즘
                .compact();
    }

    // 토큰에서 사용자 정보 추출
    /**
     * 토큰에서 사용자 ID (Subject)를 추출
     * @param token JWT 문자열
     * @return 사용자 ID
     */
    public String getUserIdFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody().getSubject();
    }

    // 토큰 유효성 검사
    /**
     * 토큰의 유효성을 검증
     * @param authToken 검증할 JWT문자열
     * @return 토큰이 유효하면 true, 아니면 false
     */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            System.err.println("Invalid JWT signature : " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("Expired JWT token : " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("Unsupported JWT token : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty : " + e.getMessage());
        }
        return false;
    }
}
