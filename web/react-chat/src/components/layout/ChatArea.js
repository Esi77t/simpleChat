import { Menu } from "lucide-react";
import MessageBubble from "../chat/MessageBubble";
import MessageInput from "../chat/MessageInput";

const ChatArea = ({
    sidebarOpen,
    onToggleSidebar,
    currentRoom,
    messages = [],
    isConnected = false,
    isLoadingHistory = false,
    currentUserId,
    onSendMessage
}) => {
    const chatWindowRef = useRef(null);

    // 새 메시지가 추가될 때 자동 스크롤
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    if (!currentRoom) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
                <div className="text-center">
                    <p className="text-xl mb-2">채팅방을 선택해주세요</p>
                    <p className="text-sm">왼쪽 사이드바에서 채팅방을 선택하거나 새로 만들어보세요</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* 채팅방 헤더 */}
            <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6 bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleSidebar}
                        className={`${sidebarOpen ? 'hidden' : 'block'} p-2 hover:bg-gray-700 rounded-lg transition-colors`}
                        aria-label="사이드바 열기"
                    >
                        <Menu size={20} />
                    </button>
                    <h1 className="text-xl font-bold">{currentRoom.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-sm text-gray-400">
                        {isConnected ? '연결됨' : '연결 중...'}
                    </span>
                </div>
            </div>
            {/* 메시지 영역 */}
            <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingHistory ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block w-8 h-8 border-4 border-gray-600 border-t-indigo-600 rounded-full animate-spin mb-2" />
                            <p className="text-gray-400 text-sm">메시지를 불러오는 중...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">
                            메시지가 없습니다. 첫 메시지를 보내보세요!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id || msg.messageId}
                            message={msg}
                            isCurrentUser={msg.senderId === currentUserId}
                        />
                    ))
                )}
            </div>
            {/* 메시지 입력 영역 */}
            <MessageInput
                onSendMessage={onSendMessage}
                isConnected={isConnected}
                disabled={!currentRoom}
            />
        </div>
    );
};

export default ChatArea;