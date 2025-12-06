import { useEffect, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";
import useChatRoom from "../hooks/useChatRoom";
import MessageItem from "../components/MessageItem";

const ChatPage = ({ roomId, roomName, navigate }) => {
    const { accountId, nickname } = useAuth();
    const { messages, isConnected, sendMessage } = useChatRoom(roomId, accountId, nickname);
    const chatWindowRef = useRef(null);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    const [inputText, setInputText] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputText.trim()) {
            sendMessage(inputText.trim());
            setInputText('');
        }
    };

    return (
        <div className="chat-page-container">
            <header className="chat-header">
                <button onClick={() => navigate('rooms')} className="back-button">
                    &larr; 로비로 돌아가기
                </button>
                <h1 className="chat-title">{roomName}</h1>
                <div className={`chat-status ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
                    {isConnected ? '연결됨' : '연결 중...'}
                </div>
            </header>

            {/* 메시지 목록 표시 */}
            <div ref={chatWindowRef} className="chat-window">
                {messages.map((msg) => (
                    <MessageItem
                        key={msg.id}
                        message={msg}
                        isCurrentUser={msg.senderId === accountId}
                    />
                ))}
            </div>

            {/* 메시지 입력 및 전송 */}
            <form onSubmit={handleSendMessage} className="message-input-area">
                <input
                    type="text"
                    placeholder={isConnected ? "메시지를 입력하세요..." : "연결 대기 중..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="input-field message-input"
                    disabled={!isConnected}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={!isConnected || !inputText.trim()}
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default ChatPage;