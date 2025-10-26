package com.example.chat.service;

import com.example.chat.model.ChatRoom;
import com.example.chat.model.RoomType;
import com.example.chat.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    // 채팅 전용으로 처리할 것
    private final ChatRepository chatRepository;


    // 채팅 생성
    public ChatRoom createChatRoom(String roomName, String ownerId, List<String> participantIds, RoomType type) {
        // ChatRoom 객체 생성
        // 1:1 채팅일 경우 roomName을 null로 처리
        String finalRoomName = (type == RoomType.SINGLE || roomName == null || roomName.trim().isEmpty()) ? null : roomName;

        ChatRoom newRoom = ChatRoom.builder()
                .roomName(finalRoomName)
                // password는 일단 생략
                .ownerId(ownerId)
                .participantIds(participantIds)
                .type(type)
                // 생성 시점 마지막 메시지 전송 시간을 현재 시각으로 설정
                .lastMessageSentAt(LocalDateTime.now())
                .build();

        return chatRepository.save(newRoom);
    }
}
