package com.web.chatbackend.controller;

import com.web.chatbackend.dto.UserLoginRequest;
import com.web.chatbackend.dto.UserLoginResponse;
import com.web.chatbackend.dto.UserRegisterRequest;
import com.web.chatbackend.model.User;
import com.web.chatbackend.security.JwtTokenProvider;
import com.web.chatbackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.swing.*;

// 사용자 인증 (회원가입, 로그인) 관련 REST API를 처리하는 컨트롤러
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    // POST : /api/auth/register : 회원가입 엔드포인트
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegisterRequest request) {
        try {
            userService.registerUser(request);
            // 성공 시 201 Created 응답
            return new ResponseEntity<>("회원가입이 성공적으로 완료되었습니다.", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // 중복된 ID 등의 오류 시 400 Bad Request로 응답
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // POST : /api/auth/login : 로그인 엔드포인트
    // 실제 비밀번호 검증과 JWT 발급은 Spring Security의 인증 필터하고 JWT Service에서 처리
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest request) {
        try {
            // Spring Security의 AuthenticationManager를 사용하여 인증을 시도(비밀번호 검증도 포함시켜서)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUserId(),
                            request.getPassword()
                    )
            );

            // 인증 성공 후에 Security Context에 Authentication 객체를 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // JWT 토큰 생성
            String jwt = jwtTokenProvider.generateToken(authentication);

            // 사용자 정보 조회 및 응답 구성
            User user = userService.getUserByUserId(request.getUserId());

            UserLoginResponse response = UserLoginResponse.builder()
                    .userId(user.getUserId())
                    .nickname(user.getNickname())
                    .token(jwt)
                    .build();

            // 성공 시 200 OK와 함께 토큰 응답
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return new ResponseEntity<>("로그인 정보가 유효하지 않습니다.", HttpStatus.UNAUTHORIZED);
        }
    }
}
