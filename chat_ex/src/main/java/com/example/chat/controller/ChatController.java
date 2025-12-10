package com.example.chat.controller;

import com.example.chat.dto.ChatRoomCreateRequest;
import com.example.chat.model.ChatRoom;
import com.example.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chat/rooms")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatRoom> createChatRoom(@RequestBody ChatRoomCreateRequest request, Principal principal) {

        String currentUserId = principal.getName();

        if(!request.ownerId().equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ChatRoom room = chatService.createChatRoom(
                request.roomName(),
                request.ownerId(),
                request.participantIds(),
                request.type()
        );
        return ResponseEntity.ok(room);
    }
}
