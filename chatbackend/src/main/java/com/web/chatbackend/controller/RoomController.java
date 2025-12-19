package com.web.chatbackend.controller;

import com.web.chatbackend.dto.RoomCreateRequest;
import com.web.chatbackend.model.Room;
import com.web.chatbackend.model.User;
import com.web.chatbackend.service.RoomService;
import com.web.chatbackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 채팅방 생성 및 조회 관련 REST API를 제공하는 컨트롤러
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final UserService userService;

    /**
     * 새로운 채팅방을 생성
     * @param userDetails 인증된 사용자 정보 (@AuthenticationPrincipal을 통해 JWT에서 추출)
     * @return request 방 생성 요청 정보
     */
    @PostMapping
    public ResponseEntity<Room> createRoom(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RoomCreateRequest request
            ) {
        // 현재 로그인한 사용자의 엔티티 정보 조회 (PK ID를 가지고 조회함)
        User user = userService.getUserByUserId(userDetails.getUsername());

        // 방 생성 로직 호출
        Room createdRoom = roomService.createRoom(request, user.getId());

        return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
    }

    // 모든 채팅방을 조회 (페이징 지원)
    @GetMapping
    public ResponseEntity<List<Room>> getRooms(
            @PageableDefault(size = 20) Pageable pageable
            ) {
        return ResponseEntity.ok(roomService.findAllRooms(pageable));
    }

    // 특정 채팅방의 상세 정보를 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.findByRoomById(roomId));
    }

    // 비공개 방 입장 시 비밀번호를 확인
    @PostMapping("/{roomId}/check-password")
    public ResponseEntity<Boolean> checkPassword(
            @PathVariable Long roomId,
            @RequestParam(required = false) String password
    ) {
        boolean isValid = roomService.checkRoomPassword(roomId, password);
        return ResponseEntity.ok(isValid);
    }
}
