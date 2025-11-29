package com.example.chat.config;

import com.example.chat.dto.ChatMessageResponse;
import com.example.chat.model.MessageType;
import com.example.chat.service.ChatMessageService;
import com.example.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService messageService;
    private final ChatService chatService;

    // WebSocket 연결 시 이벤트 처리
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        UsernamePasswordAuthenticationToken principal = (UsernamePasswordAuthenticationToken) headerAccessor.getUser();

        if (principal != null) {
            String userId = principal.getName();  // CustomUserDetailsService에서 설정한 userId
            log.info("User connected: {}", userId);

            List<String> roomIds = chatService.findRoomIdsByUserId(userId);
            for (String roomId : roomIds) {
                ChatMessageResponse enterMessage = messageService.createSystemMessage(
                        roomId, userId, MessageType.ENTER, "님이 입장했습니다."
                );

                messagingTemplate.convertAndSend("/topic/chat/" + roomId, enterMessage);
            }
        }
    }

    // WebSocket 연결 해제 시 이벤트 처리
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        UsernamePasswordAuthenticationToken principal = (UsernamePasswordAuthenticationToken) headerAccessor.getUser();

        if (principal != null) {
            String userId = principal.getName();  // CustomUserDetailsService에서 설정한 userId
            log.info("User disconnected: {}", userId);

            List<String> roomIds = chatService.findRoomIdsByUserId(userId);
            for (String roomId : roomIds) {
                ChatMessageResponse quitMessage = messageService.createSystemMessage(
                        roomId, userId, MessageType.QUIT, "님이 퇴장했습니다."
                );

                messagingTemplate.convertAndSend("/topic/chat/" + roomId, quitMessage);
            }
        }
    }
}
