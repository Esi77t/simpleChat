package com.web.chatbackend.dto;

import com.web.chatbackend.model.Message;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

/**
 * 채팅방 메시지 이력 조회 시 클라이언트에게 전달할 응답 DTO
 */
@Getter
@Builder  // Builder 패턴을 사용하여 Message 엔티티로부터 DTO를 생성
public class RoomMessageResponse {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Long messageId;
    private Long roomId;
    private Long senderId;
    private String senderNickname;  // 메시지를 보낸 사용자의 닉네임 (조인/서비스 계층에서 추가할 예정)
    private String content;
    private String timestamp;

    /**
     * Message 엔티티와 발신자 닉네임을 사용하여 DTO를 생성하는 정적 팩토리 메서드
     * @param message Message 엔티티
     * @param senderNickname 발신자 닉네임
     * @return RoomMessageResponse DTO
     */
    public static RoomMessageResponse fromEntity(Message message, String senderNickname) {
        return RoomMessageResponse.builder()
                .messageId(message.getId())
                .roomId(message.getRoomId())
                .senderId(message.getSenderId())
                .senderNickname(senderNickname)
                .content(message.getContent())
                .timestamp(message.getTimestamp().format(FORMATTER))
                .build();
    }
}
