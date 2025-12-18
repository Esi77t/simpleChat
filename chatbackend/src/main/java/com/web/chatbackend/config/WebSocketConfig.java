package com.web.chatbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// WebSocket하고 STOMP 설정을 담당하는 클래스
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 브로커 설정
        // /sub로 시작하는 목적지로 구독하는 클라이언트들에게 메시지를 전달
        registry.enableSimpleBroker("/sub");
        // /pub으로 시작하는 메시지는 @MessageMapping이 붙은 메서드로 라우트
        registry.setApplicationDestinationPrefixes("/pub");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // STOMP 엔드포인트 등록
        // 클라이언트가 처음 WebSocket 연결을 맺을 때 사용할 주소
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")  // 모든 도메인에서 접속을 허용
                .withSockJS();                  // WebSocket을 지원하지 않는 브라우저를 위해 SockJS를 지원
    }
}
