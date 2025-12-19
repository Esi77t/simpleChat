package com.web.chatbackend.service;

import com.web.chatbackend.dto.ChatMessageDto;
import com.web.chatbackend.dto.RoomMessageResponse;
import com.web.chatbackend.model.Message;
import com.web.chatbackend.model.User;
import com.web.chatbackend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;


@Service
@Transactional
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserService userService;  // 발신자 닉네임 조회용

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * STOMP로 수신된 메시지를 데이터베이스에 저장
     * @param messageDto 클라이언트로부터 수신된 메시지 DTO
     * @return 저장된 Message 엔티티
     */
    public Message saveMessage(ChatMessageDto messageDto) {
        // DTO에서 수신된 senderId 는 User 엔티티의 ID(PK)라고 가정
        Long senderPkId = null;
        try {
            // 실제 사용자 ID(login ID)가 아니라 내부 PK인 Long 타입으로 변환
            // 여기서 임시로 담고 있음을 가정
            senderPkId = Long.parseLong(messageDto.getSenderId());
        } catch (NumberFormatException e){
            System.err.println("Invalid senderId format : " + messageDto.getSenderId());
            throw new IllegalArgumentException("유효하지 않은 발신자 ID 형식입니다.");
        }

        Message message = Message.builder()
                .roomId(Long.parseLong(messageDto.getRoomId()))
                .senderId(senderPkId)
                .content(messageDto.getContent())
                .build();

        messageDto.setTimestamp(messageDto.getTimestamp().formatted(FORMATTER));

        return messageRepository.save(message);
    }
    /**
     * 특정 채팅방의 메시지 이력을 조회하고 닉네임을 매핑합니다.
     * @param roomId 채팅방 ID
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지당 메시지 수
     * @return RoomMessageResponse DTO 리스트
     */
    public List<RoomMessageResponse> findMessageHistory(Long roomId, int page, int size) {
        // 메시지 조회 시, 최신 메시지가 위에 오도록 timestamp 기준 내림차순으로 조회
        Pageable pageable = PageRequest.of(page, size);

        List<Message> messages = messageRepository.findByRoomIdOrderByTimestampDesc(roomId, pageable);

        // 엔티티 리스트를 DTO리스트로 변환하는 과정
        return messages.stream()
                .map(message -> {
                    // 닉네임을 조회하기 위해 User Service 사용
                    String nickname = null;
                    try {
                        User sender = userService.getUserById(message.getSenderId());   // Long ID로 조회하는 메서드
                        nickname = sender.getNickname();
                    } catch (Exception e) {
                        nickname = "없는 닉네임";
                    }

                    return RoomMessageResponse.fromEntity(message, nickname);
                })
                .collect(Collectors.toList());
    }
}
