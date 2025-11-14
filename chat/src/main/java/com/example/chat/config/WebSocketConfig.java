package com.example.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 웹소켓 연결 엔드포인트 : ws://[host]:[port]/ws
        // SockJS를 활성화하고 모든 오리진(Origin)에서 접속을 허용
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 메시지 구독 요청 Prefix (클라이언트가 메시지를 받을 경로)
        config.enableSimpleBroker("/topic");

        // 메시지 전송요청 Prefix (클라이언트가 서버로 메시지를 보낼 경로)
        config.setApplicationDestinationPrefixes("/app");
    }
}
