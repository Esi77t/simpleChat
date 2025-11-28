package com.example.chat.config;

import com.example.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService messageService;

    // WebSocket 연결 시 이벤트 처리

    // WebSocket 연결 해제 시 이벤트 처리
}
