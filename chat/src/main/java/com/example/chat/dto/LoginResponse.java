package com.example.chat.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class LoginResponse {
    String accountId;
    String userId;
    String nickname;
    String token;
}
