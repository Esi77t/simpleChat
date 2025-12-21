package com.web.chatbackend.controller;

import com.web.chatbackend.dto.RoomMessageResponse;
import com.web.chatbackend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 채팅 메시지 이력, 조회 관련 REST API를 제공하는 컨트롤러
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    /**
     * 특정 채팅방의 메시지 이력을 조회
     * @param roomId 채팅방ID
     * @param page 페이지 번호(0부터 시작)
     * @param size 한번에 가져올 메시지 수
     */
    @GetMapping("/{roomId}/history")
    public ResponseEntity<List<RoomMessageResponse>> getMessageHistory(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        List<RoomMessageResponse> history = messageService.findMessageHistory(roomId, page, size);
        return ResponseEntity.ok(history);
    }

}
