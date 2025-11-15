package com.example.chat.dto;

// 클라가 읽은 걸 확인 요청 했을 때 서버로 전송 하는 DTO
public record ReadReceiptRequest(
        String messageId,
        String accountId
) {}
