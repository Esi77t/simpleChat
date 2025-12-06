import { useMemo } from "react"

const MessageItem = ({ message, isCurrentUser }) => {
    const time = useMemo(() => {
        const date = new Date(message.timestamp);
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }, [message.timestamp]);

    const containerClass = isCurrentUser ? 'message-container message-mine' : 'message-container message-other';

    return (
        <div className={containerClass}>
            <div className="message-content">
                {!isCurrentUser && (
                    <div className="message-nickname">{message.senderNickname}</div>
                )}
                <div className="message-bubble">
                    <p className="message-text">{message.text}</p>
                </div>
                <div className="message-time">{time}</div>
            </div>
        </div>
    );
}

export default MessageItem;