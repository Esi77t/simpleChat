package com.example.chat.controller;

import com.example.chat.dto.ChatMessageRequest;
import com.example.chat.dto.ChatMessageResponse;
import com.example.chat.dto.ReadReceiptRequest;
import com.example.chat.model.ChatAccount;
import com.example.chat.model.ChatMessage;
import com.example.chat.model.MessageType;
import com.example.chat.repository.ChatAccountRepository;
import com.example.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

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
        Optional<ChatAccount> senderOpt = chatAccountRepository.findByUserId(request.senderId());
        String nickname = senderOpt.map(ChatAccount::getNickname).orElse("알 수 없는 사용자");

        // 메시지 엔티티 생성
        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(request.roomId())
                .senderId(request.senderId())
                .type(request.type() != null ? request.type() : MessageType.TALK)
                .message(request.message())
                .timeStamp(LocalDateTime.now())
                .readByAccountsIds(Collections.singletonList(senderOpt.map(ChatAccount::getAccountId).orElse(null)))
                .build();

        // DB 저장
        ChatMessage savedMessage = messageService.saveMessage(chatMessage);

        // 클라 응답 DTO 생성
        ChatMessageResponse response = new ChatMessageResponse(
                savedMessage.getMessageId(),
                savedMessage.getRoomId(),
                savedMessage.getSenderId(),
                nickname,
                savedMessage.getType(),
                savedMessage.getMessage(),
                savedMessage.getTimeStamp(),
                savedMessage.getReadByAccountsIds().size()
        );

        // STOMP 브로커를 통해 구독자에게 메시지 전파
        // 구독 경로 : /topic/chat/{roomId}
        messagingTemplate.convertAndSend("/topic/chat/" + request.roomId(), response);
    }

    // 읽음 확인 요청을 받아 DB에 업데이트하고 변경된 읽음 수를 브로드캐스팅한다.
    // 경로 : /app/chat/read
    public void markMessageAsRead(ReadReceiptRequest request) {
        try {
            // Service를 통해 DB에 읽음 처리 로직 수행(읽음 수 업데이트)
            int newReadCount = messageService.markAsRead(request.messageId(), request.accountId());

            //
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
