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
}
