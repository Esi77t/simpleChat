import { useCallback, useState } from "react";

const MessageInput = ({ sendMessage, isConnected }) => {
    const [message, setMessage] = useState("");

    // 텍스트 입력 변경 핸들러
    const handleChange = useCallback((e) => {
        setMessage(e.target.value);
    }, []);

    // 메시지 전송 핸들러
    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (trimmedMessage && isConnected) {
            // 훅에서 전달 받은 sendMessage 함수를 호출하여 STOMP 메시지 전송
            sendMessage(trimmedMessage);
            setMessage("");
        } else if (!isConnected) {
            console.warn("WebSocket is not connected. Message send failed.");
        }
    }, [message, sendMessage, isConnected]);

    // 엔터 키 입력 처리 (폼 제출과 동일하게)
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    }, [handleSubmit]);

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                padding: '10px',
                borderTop: '1px solid #eee',
                display: 'flex'
            }}
        >
            <input
                type="text"
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={isConnected ? "메시지를 입력하세요." : "연결 중..."}
                disabled={!isConnected}
                style={{
                    flexGrow: 1,
                    padding: '8px',
                    marginRight: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />
            <button
                type="submit"
                disabled={!isConnected || !message.trim()}
                style={{
                    padding: '8px 15px',
                    background: isConnected ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isConnected ? 'pointer' : 'not-allowed'
                }}
            >
                전송
            </button>
        </form>
    );
}

export default MessageInput;