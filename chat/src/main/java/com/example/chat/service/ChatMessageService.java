package com.example.chat.service;

import com.example.chat.dto.ChatMessageRequest;
import com.example.chat.dto.ChatMessageResponse;
import com.example.chat.model.*;
import com.example.chat.repository.ChatAccountRepository;
import com.example.chat.repository.ChatMessageRepository;
import com.example.chat.repository.ChatRepository;
import com.example.chat.repository.ReadReceiptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {

    private final ChatMessageRepository messageRepository;
    private final ChatAccountRepository accountRepository;
    private final ReadReceiptRepository readReceiptRepository;
    private final ChatRepository chatRepository;

    private ChatMessageService self;

    // 1. 메시지 처리, 저장 및 응답 DTO 반환
    @Transactional
    public ChatMessageResponse processAndBroadcastMessage(ChatMessageRequest request) {

        // 닉네임 조회 (Optional 사용으로 안정성 확보)
        ChatAccount sender = accountRepository.findByUserId(request.senderId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 발신자 ID입니다."));
        final String senderAccountId = sender.getAccountId();

        // ChatRoom의 마지막 메시지 시간 업데이트 (Room에 대한 의존성 추가)
        ChatRoom room = chatRepository.findById(request.roomId())
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));
        room.setLastMessageSentAt(LocalDateTime.now()); // ChatRoom 엔티티에 setter 필요
        chatRepository.save(room);

        // 메시지 엔티티 생성 (createdAt은 Auditing 미적용 시 수동으로)
        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(request.roomId())
                .senderId(request.senderId())
                .type(request.type() != null ? request.type() : MessageType.TALK)
                .message(request.message())
                .createdAt(LocalDateTime.now())
                // 메시지를 보낸 사람은 자동으로 읽은 것으로 처리
                // .readByAccountsIds(new ArrayList<>(List.of(sender.getAccountId())))
                .build();

        ChatMessage savedMessage = messageRepository.save(chatMessage);
        final String savedMessageId = savedMessage.getMessageId();

        ReadReceipt senderReceipt = new ReadReceipt(savedMessageId, senderAccountId);
        readReceiptRepository.save(senderReceipt);

        ChatMessageResponse response = convertToResponse(savedMessage);

        return response.withReadCount(1); // DTO 변환 메서드 활용
    }

    @Transactional
    public int markAsReadAndGetCount(String messageId, String accountId) {
    //        ChatMessage message = messageRepository.findById(messageId)
    //                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다."));
    //        if (!message.getReadByAccountsIds().contains(accountId)) {
    //            message.getReadByAccountsIds().add(accountId);
    //            messageRepository.save(message); // 변경된 엔티티 저장
    //        }
        self.saveReadReceipt(messageId, accountId);

        return (int) readReceiptRepository.countByMessageId(messageId);
    }

    // 특정 메시지 읽음 확인 처리 및 읽음 수 반환
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void saveReadReceipt(String messageId, String accountId) {

        try {
            ReadReceipt receipt = new ReadReceipt(messageId, accountId);
            readReceiptRepository.save(receipt);
            readReceiptRepository.flush();
        } catch (DataIntegrityViolationException e) {

        } catch (Exception e) {
            log.error("읽음 기록 처리 중 예상치 못한 오류 발생", e);
            throw e;
        }
    }

    // 시스템 메시지를 생성하고 응답 DTO로 반환
    public ChatMessageResponse createSystemMessage(String roomId, String userId, MessageType type, String customMessage) {
        ChatAccount sender = accountRepository.findByUserId(userId)
                .orElse(ChatAccount.builder().nickname("시스템").userId("system").build());

        String fullMessage = sender.getNickname() + customMessage;

        return new ChatMessageResponse(
                UUID.randomUUID().toString(),
                roomId,
                "system",
                "시스템",
                type,
                fullMessage,
                LocalDateTime.now(),
                0
        );
    }


    // ChatMessage 엔티티를 ChatMessageResponse DTO로 변환
    public ChatMessageResponse convertToResponse(ChatMessage message) {
        // 닉네임 조회를 위해 ChatAccount가 필요
        String nickname = accountRepository.findByUserId(message.getSenderId())
                .map(ChatAccount::getNickname)
                .orElse("알 수 없는 사용자");

        return new ChatMessageResponse(
                message.getMessageId(),
                message.getRoomId(),
                message.getSenderId(),
                nickname,
                message.getType(),
                message.getMessage(),
                message.getCreatedAt(),
                // message.getReadByAccountsIds().size()
                0
        );
    }

    // 특정 채팅방의 이전 메시지 목록을 불러옴
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatHistory(String roomId) {
        return messageRepository.findByRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}
