import { useCallback, useEffect, useRef, useState } from "react";
import useStomp from "./useStomp";
import { fetchInitialMessages } from "../api/chatApi";
import useAuth from "./useAuth";

// Mock 채팅 메시지
const initialMessages = []; 

// 가짜 STOMP 서버 역할
const mockStompSubscribers = {};
let messageIdCounter = 4;

const useChatRoom = (roomId, currentUserId, currentNickname) => {

 const [messages, setMessages] = useState(initialMessages);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null); // WebSocket 인스턴스를 저장할 Ref

    // 메시지 수신 함수
    const receiveMessage = useCallback((message) => {
        setMessages(prevMessages => {
            // Echo 서버는 자신이 보낸 메시지를 그대로 되돌려주기 때문에, 
            // 중복 처리 로직이 필요합니다. (최대 1초 내에 동일 메시지 방지)
            const isDuplicate = prevMessages.some(m => 
                m.text === message.text && 
                m.senderId === message.senderId && 
                (Date.now() - new Date(m.timestamp).getTime() < 1000)
            );

            if (isDuplicate) return prevMessages;
            return [...prevMessages, message];
        });
    }, []);

    // 🌟 Native WebSocket 연결/구독
    useEffect(() => {
        // 공개 에코 서버를 사용하여 연결 테스트
        // 실제 백엔드 사용 시: ws://localhost:8080/chat
        const wsUrl = 'wss://echo.websocket.org'; 
        console.log(`[WebSocket] ${wsUrl}에 연결 시도...`);

        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
            console.log(`[WebSocket] 연결 성공: ${wsUrl}`);
            setIsConnected(true);
            
            // 실제 채팅 서버에서는 이 시점에 채팅방 구독 메시지를 보내게 됩니다.
        };

        wsRef.current.onmessage = (event) => {
            try {
                // 에코 서버는 우리가 보낸 JSON 문자열을 그대로 반환합니다.
                const chatMessage = JSON.parse(event.data);

                // 유효한 채팅 메시지인지 확인 후 처리
                if (chatMessage && chatMessage.id && chatMessage.senderId) {
                    receiveMessage(chatMessage);
                }
            } catch (e) {
                // 서버가 JSON이 아닌 데이터를 반환할 경우 오류 방지
                console.error("[WebSocket] 메시지 파싱 오류 또는 비정상 데이터:", e);
            }
        };

        wsRef.current.onclose = () => {
            console.log("[WebSocket] 연결 종료.");
            setIsConnected(false);
            // 실제 앱에서는 연결 끊김 시 재연결 로직을 구현합니다.
        };
        
        wsRef.current.onerror = (error) => {
            console.error("[WebSocket] 오류 발생:", error);
        };

        // 클린업: 컴포넌트 언마운트 시 WebSocket 연결 종료
        return () => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
            setIsConnected(false);
        };
    }, [receiveMessage]); // roomId는 echo 서버에 필요 없으므로 의존성 배열에서 제외

    // 메시지 전송 함수
    const sendMessage = useCallback((text) => {
        // 연결 상태 및 입력 텍스트 유효성 검사
        if (!isConnected || !text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const chatMessage = {
            id: Date.now(), // 고유 ID (실제로는 서버가 할당해야 함)
            senderId: currentUserId,
            senderNickname: currentNickname,
            text: text,
            timestamp: new Date().toISOString(),
            roomId: roomId // 메시지에 방 ID 포함 (에코 서버는 무시)
        };

        try {
            const messageString = JSON.stringify(chatMessage);
            // WebSocket을 통해 서버로 메시지 전송
            wsRef.current.send(messageString);
            
            // 에코 서버의 경우, 서버가 메시지를 반환해 주므로 여기서 상태 업데이트를 하지 않습니다.
        } catch (error) {
            console.error("[WebSocket] 메시지 전송 오류:", error);
        }
    }, [isConnected, currentUserId, currentNickname, roomId]);


    return { messages, isConnected, sendMessage };
};

export default useChatRoom;