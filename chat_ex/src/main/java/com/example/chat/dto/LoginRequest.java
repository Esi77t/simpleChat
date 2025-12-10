package com.example.chat.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message="유저 계정은 필수입니다.")
        String userId,
        @NotBlank(message="비밀번호는 필수입니다.")
        String password
) { }
