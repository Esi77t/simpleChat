package com.web.chatbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * STOMP WebSocket을 통해 클라이언트와 서버가 주고받는 실시간 메시지 DTO
 */
@Getter
@Setter // 메시지 Service에서 timestamp를 업데이트 하기 위해 Setter가 필요
@NoArgsConstructor
public class ChatMessageDto {
    
    private MessageType type;
    
    private String roomId;  // 메시지가 전송된 방 ID
    private String senderId;    // 메시지를 보낸 사용자 ID
    private String content;     // 메시지 내용
    private String timestamp;   // 서버에서 저장 시점의 시간을 포맷하여 다시 클라이언트에게 전달
}
