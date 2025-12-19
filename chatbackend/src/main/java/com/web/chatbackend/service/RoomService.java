package com.web.chatbackend.service;

import com.web.chatbackend.dto.RoomCreateRequest;
import com.web.chatbackend.model.Room;
import com.web.chatbackend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor    // final 필드를 이용한 생성자 주입
public class RoomService {

    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 새로운 채팅방을 생성 (비공개 방일 경우 비밀번호 해시)
     * @param request 방 생성 요청 DTO
     * @param creatorId 방을 생성하는 사용자 ID (User 엔티티의 PK)
     * @return 생성된 Room 엔티티
     */
    @Transactional
    public Room createRoom(RoomCreateRequest request, Long creatorId) {
        String hashedPassword = null;

        // 비밀번호가 제공된 경우, 해시하여 저장
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            hashedPassword = passwordEncoder.encode(request.getPassword());
        }

        Room newRoom = Room.builder()
                .name(request.getName())
                .creatorId(creatorId)
                .password(hashedPassword)
                .build();

        return roomRepository.save(newRoom);
    }

    /**
     * 모든 채팅방 목록을 조회 (페이징 적용)
     * @param pageable 페이징 정보
     * @return 채팅방 목록
     */
    public List<Room> findAllRooms(Pageable pageable) {
        return roomRepository.findAll(pageable).getContent();
    }

    /**
     * ID로 특정 채팅방을 조회
     * @param roomId 채팅방 ID
     * @return Room 엔티티
     * @throws NoSuchElementException 해당 ID의 방이 없을 경우
     */
    public Room findByRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new NoSuchElementException("ID " + roomId + "를 가진 채팅방을 찾을 수 없습니다."));
    }

    /**
     * 비밀번호를 확인하고 채팅방에 입장할 수 있는 지 검사
     * @param roomId 채팅방 ID
     * @param password 사용자가 입력한 비밀번호 (공개방이면 null 또는 빈 문자열)
     * @return 비밀번호가 일치하거나 공개방이면 true
     */
    public boolean checkRoomPassword(Long roomId, String password) {
        Room room = findByRoomById(roomId);
        String storedPassword = room.getPassword();

        // 공개 방인 경우
        if (storedPassword == null || storedPassword.isEmpty()) {
            return true;
        }

        // 비공개 방인 경우
        if (password != null && !password.isEmpty()) {
            // BCrypt 해시 일치 여부 확인
            return passwordEncoder.matches(password, storedPassword);
        }

        // 비공개 방인데 비밀번호를 입력하지 않았을 경우
        return false;
    }

    /**
     * 채팅방을 삭제
     * @param roomId 삭제할 방 ID
     * @param currentUserId 삭제를 요청한 사용자 ID (방장 확인용)
     */
    public void deleteRoom(Long roomId, Long currentUserId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당방을 찾을 수 없습니다."));

        // 방장(Owner)만 삭제 가능
        if (!room.isOwner(currentUserId)) {
            throw new SecurityException("방장만 삭제가 가능합니다.");
        }

        roomRepository.delete(room);
    }

}
