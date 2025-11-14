package com.example.chat.controller;

import com.example.chat.dto.ChatMessageRequest;
import com.example.chat.repository.ChatAccountRepository;
import com.example.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebsocketController {
    // SimpMessagingTemplate: 브로커(Broker)로 메시지를 전송하는 역할
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService messageService;
    private final ChatAccountRepository chatAccountRepository;  // 닉네임 조회용

    // 클라이언트로부터 메시지를 수신하고 처리
    // 경로 : /app/chat/send (WebSocketConfig의 application destination prefix에 의해 결정됨
    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageRequest request) {
        // 닉네임 조회


        // 메시지 엔티티 생성


        // DB 저장


        // 클라 응답 DTO 생성


        // STOMP 브로커를 통해 구독자에게 메시지 전파
        // 구독 경로 : /topic/chat/{roomId}
    }
}
