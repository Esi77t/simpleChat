package com.web.chatbackend.repository;

import com.web.chatbackend.model.Room;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 채팅방(Room) 엔티티에 대한 데이터 접근을 담당
public interface RoomRepository extends JpaRepository<Room, Long> {
    /**
     * 채팅방 이름을 검색하여 목록을 조회 (대소문자 무시, 부분 일치)
     * @param name 검색할 채팅방 이름 키워드
     * @param pageable 페이징 정보
     * @return 조건에 맞는 채팅방 목록
     */
    List<Room> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * 특정 사용자가 생성한 채팅방 목록을 조회 (내 방 목록 조회 시 사용)
     * @param creatorId 방을 생성한 사용자 ID
     * @return 생성자가 일치하는 채팅방 목록
     */
    List<Room> findByCreatorId(Long creatorId);
}
