package com.web.chatbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 로그인 요청시 클라이언트로부터 받는 데이터를 정의
@Getter
@Setter
@NoArgsConstructor
public class UserLoginRequest {
    private String userId;
    private String password;
}
