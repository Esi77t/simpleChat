import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/chat";

/**
 * 특정 채팅방의 초기 메시지 목록을 조회.
 * @param {string} roomId - 조회할 채팅방 ID
 * @param {number} size - 불러올 메시지 수
 * @param {string} beforeMessageId - 특정 메시지 이전의 메시지를 조회할 때 사용하는 ID (무한 스크롤 구현 시 사용)
 * @returns {Promise<Array<Object>>} 메시지 객체 배열
 */
export const fetchInitialMessages = async (roomId, size = 50, beforeMessageId = null) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}/messages`, {
            params: {
                size: size,
                before: beforeMessageId     // 백엔드에서 이 파라미터를 처리할 예정
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        return response.data.map(serverMsg => ({
            messageId: serverMsg.messageId,
            senderId: serverMsg.senderId,
            content: serverMsg.message,     // 백엔드의 'message' 필드를 클라이언트의 'content'로 매핑
            readCount: serverMsg.readByAccountsIds ? serverMsg.readByAccountsIds.length : 1, // 초기 읽음 수
            timestamp: serverMsg.createdAt,
        }));
    } catch (error) {
        console.error("Error fetching initial messages:", error);
        return [];
    }
}

const fetchChatRoom = async (roomId, accountId) => {

}

const createChatRoom = async (roomId) => {

}