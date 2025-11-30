package com.example.chat.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    // application.yml에서 주입 받는 시크릿 키 문자열
    @Value("${jwt.secret-key}")
    private String secretKey;

    // 토큰 만료 시간
    @Value("${jwt.expiration-time}")
    private long expirationTime;

    private SecretKey key;

    private final UserDetailsService userDetailsService;

    // 시크릿 키를 SecretKey 객체로 변환하고 초기화
    @PostConstruct
    protected void init() {
//        System.out.println("============JWT SECRET KEY LOADED=============");
//        System.out.println("key : " + secretKey);
//        System.out.println("==============================================");

        key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // 1. 토큰 생성
    private String createToken(String userId) {
        Claims claims = Jwts.claims().setSubject(userId);
        Date now = new Date();
        Date validity = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(Authentication authentication) {
        String userId = authentication.getName();
        return createToken(userId);
    }

    // 2. HTTP 요청 헤더에서 JWT 토큰 추출 (JwtAuthenticationFilter에서 사용)
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);

            return token.trim().replaceAll("^\"|\"$", "");
        }

        return null;
    }

    // 3. JWT 토큰을 기반으로 인증 정보를 조회
    public Authentication getAuthentication(String token) {
        // 토큰에서 사용자 ID를 추출
        String userId = getUserId(token);

        // UserDetailsService를 통해 UserDetails 객체를 로드
        UserDetails userDetails = userDetailsService.loadUserByUsername(userId);

        // UserDetails를 기반으로 새로운 Authentication 객체 생성후 반환
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    // 4. 토큰에서 사용자 ID 추출
    public String getUserId(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 5. 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
//            log.info("========== VALIDATING TOKEN ==========");
//            log.info("Received Token: [{}]", token);
//            log.info("====================================");

            // 토큰을 파싱하면서 유효성 검사 및 만료 시간 확인
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            // 잘못된 JWT 서명
            log.info("Invalid JWT signature");
        } catch (ExpiredJwtException e) {
            // 만료된 JWT 토큰
            log.info("Expired JWT token");
        } catch (UnsupportedJwtException e) {
            // 지원되지 않은 JWT 토큰
            log.info("Unsupported JWT token");
        } catch (IllegalArgumentException e) {
            // JWT토큰이 잘못되었거나 비어있음
            log.info("JWT claims string is empty");
        }

        return false;
    }
}
