package com.example.chat.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketJwtInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider tokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");

            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
               try {
                   String jwt = authorizationHeader.substring(7);

                   if (tokenProvider.validateToken(jwt)) {
                       Authentication authentication = tokenProvider.getAuthentication(jwt);

                       accessor.setUser(authentication);
                       log.info("WebSocket authenticated for user : {}", authentication.getName());
                   } else {
                       log.warn("Invalid or expired JWT token for STOMP connection.");
                   }
               } catch (Exception e) {
                   log.error("Error during WebSocket authentication : {}", e.getMessage());
               }
            }
        }

        return message;
    }
}
