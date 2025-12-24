const MessageBubble = ({ message, isCurrentUser }) => {
    // 시간 포맷팅
    const formattedTime = useMemo(() => {
        try {
            const date = new Date(message.timestamp);
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return message.timestamp || '';
        }
    }, [message.timestamp]);

    return (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {/* 발신자 닉네임 (내 메시지가 아닐 때만 표시) */}
                {!isCurrentUser && (
                    <span className="text-sm text-gray-400 px-2">
                        {message.senderNickname || '알 수 없음'}
                    </span>
                )}
                {/* 메시지 버블 */}
                <div className={`px-4 py-2 rounded-2xl ${isCurrentUser
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-700 text-white rounded-bl-sm'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text || message.content}
                    </p>
                </div>
                {/* 타임스탬프 */}
                <span className="text-xs text-gray-500 px-2">
                    {formattedTime}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;