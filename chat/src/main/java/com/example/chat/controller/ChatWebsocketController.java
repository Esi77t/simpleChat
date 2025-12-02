package com.example.chat.controller;

import com.example.chat.dto.ChatMessageRequest;
import com.example.chat.dto.ChatMessageResponse;
import com.example.chat.dto.ReadReceiptRequest;
import com.example.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.stream.Collectors;


@Controller
@RequiredArgsConstructor
public class ChatWebsocketController {
    // SimpMessagingTemplate: 브로커(Broker)로 메시지를 전송하는 역할
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService messageService;

    // 클라이언트로부터 메시지를 수신하고 처리
    // 경로 : /app/chat/send (WebSocketConfig의 application destination prefix에 의해 결정됨
    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageRequest request) {
        ChatMessageResponse response = messageService.processAndBroadcastMessage(request);

        // STOMP 브로커를 통해 구독자에게 메시지 전파
        // 구독 경로 : /topic/chat/{roomId}
        messagingTemplate.convertAndSend("/topic/chat/" + request.roomId(), response);
    }

    // 읽음 확인 요청을 받아 DB에 업데이트하고 변경된 읽음 수를 브로드캐스팅한다.
    // 클라 경로 : /app/chat/send 로 요청
    // 서버 경로 : /topic/chat/{roomId} 로 응답
    @MessageMapping("/chat/read")
    public void markMessageAsRead(ReadReceiptRequest request) {
        System.out.println(">>> [SERVER DEBUG] Received /chat/read request for message: " + request.messageId());
        try {
            // Service를 통해 DB에 읽음 처리 로직 수행(읽음 수 업데이트)
            int newReadCount = messageService.markAsReadAndGetCount(request.messageId(), request.accountId());

            // 클라이언트에게 업데이트 된 읽음 수를 보낸다
            // 경로 : /topic/chat/{roomId}/read_update

            // 메시지를 조회하고 방 고유 ID를 얻는다
            // 여기서 임시로 메시지 ID에서 정보를 추출한다고 가정, 클라이언트 DTO에 roomId를 추가로 넣거나 할 수 있음
            // -> ReadReceiptRequest DTO에 roomId 필드를 추가하는 것이 가장 효율적

            // 현재 ChatMessageService에는 messageId만으로 roomId를 조회하는 기능이 없으므로,
            // 여기서는 클라이언트가 ReadReceiptRequest DTO에 roomId를 포함해서 보낸다고 가정하고 코드를 수정.
            // 클라이언트에게 보낼 읽음 업데이트 정보 DTO
            record ReadUpdate(String messageId, int readCount) {}
            // 임시로 MessageID를 사용하여 응답 객체 생성
            ReadUpdate update = new ReadUpdate(request.messageId(), newReadCount);
<<<<<<< HEAD

            // SimpMessagingTemplate을 사용해서 구독채널로 브로드캐스트
            String destination = "/topic/chat/" + request.roomId() + "/read_update";
            messagingTemplate.convertAndSend(destination, update);

            System.out.println("Read update broadcasted to : " + destination + " with count : " + newReadCount);

=======
>>>>>>> parent of 2489b4c (commit)
        } catch (IllegalArgumentException e) {
            System.err.println("Read receipt failed : " + e.getMessage());
        }
    }

    // 채팅방의 이전 메시지 기록을 HTTP GET으로 제공
    @GetMapping("/api/v1/chat/history/{roomId}")
    public List<ChatMessageResponse> getChatHistory(@PathVariable String roomId) {
        return messageService.getChatHistory(roomId);
    }
}
