package com.example.chat.dto;

import jakarta.validation.constraints.NotBlank;

// 회원가입 요청 DTO
record SignUpRequest(
        @NotBlank(message="유저 계정은 필수입니다.")
        String userId,
        @NotBlank(message="비밀번호는 필수입니다.")
        String password,
        @NotBlank(message="닉네임은 필수입니다.")
        String nickname
) { }

// 로그인 요청 DTO
record LoginRequest(
        @NotBlank(message="유저 계정은 필수입니다.")
        String userId,
        @NotBlank(message="비밀번호는 필수입니다.")
        String password
) { }

// 로그인 응답 DTO
record LoginResponse(
        String accountId,
        String userId,
        String nickname,
        String token
) { }