import { useEffect, useState } from "react";
import useStomp from "./useStomp";
import { fetchInitialMessages } from "../api/chatApi";

// 읽음 요청이 서버로 중복 전송되는 것을 막는 용도
const readRequestCache = new Set();

const useChatRoom = (roomId, currentAccountId) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const WS_URL = "http://localhost:8080/ws";
    const { isConnected, subscribe, send } = useStomp(WS_URL);

    // REST API를 통해서 채팅방 초기 메시지를 불러오기
    useState(() => {
        if (roomId && currentAccountId && !messages.length) {
            setIsLoading(true);
            fetchInitialMessages(roomId)
                .then(data => {
                    setMessages(data);
                    setIsLoading(false);
                });
        }
    }, [roomId, currentAccountId]);

    // === 웹소켓 메시지 수신 핸들러 ===
    // 새 메시지 수신 처리 (/topic/chat/{roomId})
    const handleNewMessage = (newMessage) => {
        setMessages(prevMessage => [...prevMessage, newMessage]);
    };

    // 읽음 수 업데이트 처리 (/topic/chat/{roomId}/read_update)
    const handleReadUpdate = (readUpdate) => {
        const { messageId, readCount } = readUpdate;

        setMessages(prevMessage => {
            return prevMessage.map(msg => {
                if (msg.messageId === messageId) {
                    return {
                        ...msg,
                        readCount: readCount
                    };
                }
                return msg;
            });
        });
    };

    // === 구독 연결 관리 ===
    useEffect(() => {
        if (isConnected && roomId) {
            // 메시지 수신 채널 구독
            subscribe(`/topic/chat/${roomId}`, handleNewMessage);

            // 읽음 수 업데이트 채널 구독
            subscribe(`/topic/chat/${roomId}/read_update`, handleReadUpdate);
        }
    }, [isConnected, roomId, subscribe]);

    // === 읽음/전송 액션 함수 ===
    // 읽음 요청 전송 (클라이언트 중복 방지 로직도 포함)
    const markMessageAsRead = (messageId) => {
        if (!isConnected) return;

        // 이미 요청을 보낸 메시지는 다시 보내지 않는다
        if (readRequestCache.has(messageId)) return;

        const readRequest = {
            roomId: roomId,
            messageId: messageId,
            accountId: currentAccountId,    // 현재 로그인 된 사용자 ID
        };

        // 서버로 읽음 요청을 전송
        send(`/app/chat/read`, readRequest);

        // 캐시에 추가하여 중복 요청 차단
        readRequestCache.add(messageId);
    };

    // 메시지 전송
    const sendMessage = (messageContent) => {
        if (!isConnected || !messageContent.trim()) return;

        const chatMessage = {
            roomId: roomId,
            senderId: currentAccountId,
            type: "TEXT",
            message: messageContent,
        };

        send(`/app/chat/message`, chatMessage);
    }

    return {
        isLoading,
        messages,
        isConnected,
        sendMessage,
        markMessageAsRead,
    };
}

export default useChatRoom;