import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/chat";

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