package com.example.chat.controller;

import com.example.chat.repository.ChatAccountRepository;
import com.example.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebsocketController {
    // SimpMessagingTemplate: 브로커(Broker)로 메시지를 전송하는 역할
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService messageService;
    private final ChatAccountRepository chatAccountRepository;  // 닉네임 조회용
}
