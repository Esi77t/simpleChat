package com.web.chatbackend.repository;

import com.web.chatbackend.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 채팅 메시지(Message) 엔티티에 대한 데이터 접근을 담당
public interface MessageRepository extends JpaRepository<Message, Long> {
    /**
     * 특정 채팅방의 메시지 이력을 조회
     * 메시지는 최신순으로 정렬 (timestamp 기준 내림차순)
     * @param roomId 메시지가 속한 방 ID
     * @param pageable 페이징 정보 (스크롤 시 이전 메시지 로딩에 사용)
     * @return 해당 방의 메시지 목록 (Pageable 기준
     */
    List<Message> findByRoomIdOrderByTimestampDesc(Long roomId, Pageable pageable);

    /**
     * 특정 채팅방의 메시지 중 가장 최근의 메시지 1개를 조회
     * 방 목록에서 마지막 메시지를 표시하는데 사용
     * @param roomId 메시지가 속한 방 ID
     * @return 가장 최근 메시지 목록 (1개)
     */
    List<Message> findTop1ByRoomIdOrderByTimestampDesc(Long roomId);
}
