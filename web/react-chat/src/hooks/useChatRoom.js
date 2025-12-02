import { useState } from "react";
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
}