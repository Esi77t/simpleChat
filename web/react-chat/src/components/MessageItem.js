import { useEffect, useRef } from "react";

const MessageItem = ({ message, isMyMessage, markAsRead }) => {
    const messageRef = useRef(null);

    // IntersectionObserver를 사용하여 메시지가 화면에 나타나는지 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // 메시지가 화면에 50% 이상 보일 때 (isIntersection && !message.readByMe)
                // 그리고 해당 메시지가 내가 보낸 메시지가 아닐 경우에만
                if (entry.isIntersecting && !isMyMessage) {
                    // markAsRead 호출 : useChatRoom 훅 내부의 캐싱 로직에 의해서
                    // 해당 메시지에 대한 요청은 단 한 번만 서버로 전송이 된다.
                    markAsRead(message.messageId);
                    observer.unobserve(entry.target);
                }
            },
            {
                root: null,     // 뷰 포트
                rootMargin: '0px',
                threshold: 0.5,     // 메시지가 50% 이상 보일 때 트리거
            }
        );

        if (messageRef.current) {
            observer.unobserve(messageRef.current);
        }
    }, [message.messageId, isMyMessage, markAsRead]);

    const style = {
        alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        background: isMyMessage ? '#dcf8c6' : '#f0f0f0',
        padding: '8px 12px',
        borderRadius: '10px',
        marginBottom: '10px',
        maxWidth: '70%',
        wordBreak: 'break-word',
    };

    const countStyle = {
        fontSize: '10px',
        color: '#888',
        margin: '0 5px',
        fontWeight: 'bold',
        alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        textAlign: isMyMessage ? 'right' : 'left',
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        }}>
            <div ref={messageRef} style={style}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '12px' }}>
                    {isMyMessage ? '나' : message.senderId}
                </div>
                <div>{message.content}</div>
                <div style={{ fontSize: '10px', marginTop: '5px', color: '#999' }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
            <div style={countStyle}>
                읽음: {message.readCount}
            </div>
        </div>
    );
}

export default MessageItem;