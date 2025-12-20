package com.web.chatbackend.config;

import com.web.chatbackend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

// WebSocket 연결 시 JWT 토큰을 검증하는 인터셉터
@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // WebSocket 연결 시 (CONNECT) 토큰 검증
        if (StompCommand.CONNECT == accessor.getCommand()) {
            String jwt = accessor.getFirstNativeHeader("Authorization");
            log.info("WebSocket CONNECT : 유효성 검사 시작");

            if (jwt != null && jwt.startsWith("Bearer ")) {
                jwt = jwt.substring(7);
                if (jwtTokenProvider.validateToken(jwt)) {
                    log.info("WebSocket 인증 성공 : {}", jwtTokenProvider.getUserIdFromToken(jwt));
                } else {
                    log.error("WebSocket 인증 실패 : 유효하지 않은 토큰");
                    throw new AccessDeniedException("인증 토큰이 유효하지 않습니다.");
                }
            } else {
                log.error("WebSocket 인증 실패 : 토큰 없음");
                throw new AccessDeniedException("인증 헤더가 누락되었습니다.");
            }
        }

        return message;
    }
}
