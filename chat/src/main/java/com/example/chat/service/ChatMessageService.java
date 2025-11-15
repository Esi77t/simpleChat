package com.example.chat.service;

import com.example.chat.model.ChatMessage;
import com.example.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository messageRepository;

    // 새로운 채팅 메시지를 DB에 저장
    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        // 여기서 readByAccountIds 초기화 및 다른 비즈니스 로직 추가 예정
        return messageRepository.save(message);
    }

    // 특정 채팅방의 이전 메시지 목록을 불러옴
    @Transactional(readOnly = true)
    public List<ChatMessage> getChatHistory(String roomId) {
        return messageRepository.findByRoomIdOrderByTimeStampAsc(roomId);
    }

    // 특정 메시지 읽음 확인 처리
    @Transactional
    public int markAsRead(String messageId, String accountId) {
        // 메시지 조회
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found : " + messageId));

        // 이미 읽음 목록에서 해당 accountId가 있는지 확인
        if (!message.getReadByAccountsIds().contains(accountId)) {
            // 없으면 읽음 목록에 추가
            message.getReadByAccountsIds().add(accountId);

            // DB에 없데이트
            messageRepository.save(message);
        }

        return message.getReadByAccountsIds().size();
    }
}
