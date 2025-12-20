package com.web.chatbackend.controller;

import com.web.chatbackend.dto.ChatMessageDto;
import com.web.chatbackend.dto.MessageType;
import com.web.chatbackend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

// STOMP 메시지 핸들링을 담당하는 컨트롤러
@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessageSendingOperations messageTemplate;
    private final MessageService messageService;

    // 클라이언트에서 /pub/chat/message로 조내는 메시지를 처리
    @MessageMapping("/chat/message")
    public void message(ChatMessageDto message) {
        // 입장 메시지인 경우 안내 문구 설정
        if (MessageType.ENTER.equals(message.getType())) {
            message.setContent(message.getSenderId() + "님이 입장하셨습니다.");
        }

        // 대화 메시지인 경우 DB에 저장
        if (MessageType.TALK.equals(message.getType())) {
            messageService.saveMessage(message);
        }

        // /sub/chat/room/{roomId}를 구독 중인 클라이언트들에게 메시지 브로드 캐스트
        messageTemplate.convertAndSend("/sub/chat/room/" + message.getRoomId(),message);
    }
}
