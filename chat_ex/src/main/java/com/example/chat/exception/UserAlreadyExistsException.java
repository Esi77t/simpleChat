package com.example.chat.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// HTTP 409 Conflict를 반환하기 위해서 사용
// 유저 ID나 패스워드가 중복일 때 CONFLICT를 반환하기 위해서 사용
@ResponseStatus(HttpStatus.CONFLICT)
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
