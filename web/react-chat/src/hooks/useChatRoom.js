import { useCallback, useEffect, useState } from "react";

const useChatRoom = (roomId, currentUserId, currentNickname) => {

    const [messages, setMessages] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // STOMP 연결 설정
    const { isConnected, subscribe, send, unsubscribe } = useStomp({
        debug: false,
        onConnect: () => {
            console.log(`[CHAT] 채팅방 ${roomId} 연결 완료`);

            // 입장 메시지 전송
            send('/pub/chat/message', {
                type: 'ENTER',
                roomId: roomId,
                senderId: currentUserId,
                content: `${currentNickname}님이 입장하셨습니다.`,
            });
        },
        onError: (error) => {
            console.error('[CHAT] WebSocket 오류:', error);
        },
    });

    // 채팅방 메시지 구독
    useEffect(() => {
        if (!isConnected || !roomId) return;

        const destination = `/sub/chat/room/${roomId}`;

        const subscription = subscribe(destination, (message) => {
            console.log('[CHAT] 메시지 수신:', message);

            // 메시지를 상태에 추가
            const newMessage = {
                id: Date.now() + Math.random(), // 임시 ID
                messageId: message.messageId,
                senderId: message.senderId,
                senderNickname: message.senderNickname || currentNickname,
                text: message.content,
                timestamp: message.timestamp || new Date().toISOString(),
                type: message.type,
            };

            setMessages((prev) => [...prev, newMessage]);
        });

        // 언마운트 시 구독 취소
        return () => {
            if (subscription) {
                unsubscribe(destination);
            }
        };
    }, [isConnected, roomId, subscribe, unsubscribe, currentNickname]);

    // 이전 메시지 이력 불러오기
    useEffect(() => {
        const loadMessageHistory = async () => {
            if (!roomId) return;

            setIsLoadingHistory(true);
            try {
                const history = await chatApi.getMessageHistory(roomId, 0, 50);

                // 메시지 포맷 변환
                const formattedMessages = history.map((msg) => ({
                    id: msg.messageId,
                    messageId: msg.messageId,
                    senderId: msg.senderId,
                    senderNickname: msg.senderNickname,
                    text: msg.content,
                    timestamp: msg.timestamp,
                    type: 'TALK',
                }));

                // 오래된 메시지부터 표시 (역순 정렬)
                setMessages(formattedMessages.reverse());
                console.log(`[CHAT] ${formattedMessages.length}개의 이전 메시지 로드 완료`);
            } catch (error) {
                console.error('[CHAT] 메시지 이력 로드 실패:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadMessageHistory();
    }, [roomId]);

    // 메시지 전송
    const sendMessage = useCallback(
        (text) => {
            if (!isConnected || !text.trim()) {
                console.warn('[CHAT] 메시지 전송 불가 (연결 안됨 또는 빈 메시지)');
                return;
            }

            const messageData = {
                type: 'TALK',
                roomId: roomId,
                senderId: currentUserId,
                content: text.trim(),
            };

            send('/pub/chat/message', messageData);
        },
        [isConnected, roomId, currentUserId, send]
    );

    return {
        messages,
        isConnected,
        isLoadingHistory,
        sendMessage,
    };
};

export default useChatRoom;