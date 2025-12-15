package com.web.chatbackend.dto;

import lombok.Builder;
import lombok.Getter;

// 로그인 성공시 JWT 토큰을 클라이언트에게 전달하기 위한 DTO
@Getter
@Builder
public class UserLoginResponse {
    private String userId;
    private String nickname;
    private String token;
}
