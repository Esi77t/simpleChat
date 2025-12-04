import { useEffect, useRef } from "react";
import useChatRoom from "../hooks/useChatRoom";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";

// 현재 사용자의 ID는 로그인/인증 훅에서 가져온다고 가정
const currentAccountId = "user-account-id-from-auth";

const ChatWindow = ({ roomId }) => {
    const { isLoading, messages, isConnected, sendMessage, markMessageAsRead } = useChatRoom(roomId, currentAccountId);

    const messagesEndRef = useRef(null);     // 메시지 목록 맨 아래로 스크롤 하기 위한 Ref

    // 메시지가 업데이트 될 때마다 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (isLoading) {
        return (
            <div style={{
                    padding: '20px',
                    textAlign: 'center'
                }}
            >
                메시지를 불러오는 중
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ddd'
        }}>
            {/* 상단 연결 상태를 표시 */}
            <div style={{ padding: '10px', background: isConnected ? '#e6ffe6' : '#ffe6e6', textAlign: 'center' }}>
                {isConnected ? '채팅 서버 연결됨' : '채팅 서버 연결 끊김'}
            </div>
            {/* 메시지 목록 */}
            <div style={{
                flexGrow: 1,
                overflow: 'auto',
                padding: '10px'
            }}>
                {messages.map((msg, index) => (
                    <MessageItem
                        key={msg.messageId || index}    // messageId가 없을 경우 index를 사용
                        message={msg}
                        isMyMessage={msg.senderId === currentAccountId}
                        markAsRead={markMessageAsRead}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            {/* 메시지 입력 */}
            <MessageInput 
                sendMessage={sendMessage}
                isConnected={isConnected}
            />
        </div>
    )
}

export default ChatWindow;