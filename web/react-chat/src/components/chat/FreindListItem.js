const FriendListItem = ({ friend, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-700/50 text-gray-300 transition-all"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        {friend.avatar || '👤'}
                    </div>
                    {/* 온라인 상태 표시 */}
                    <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{friend.name}</span>
                        {friend.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                                {friend.unread > 99 ? '99+' : friend.unread}
                            </span>
                        )}
                    </div>
                    {friend.lastMessage && (
                        <p className="text-xs text-gray-400 truncate">{friend.lastMessage}</p>
                    )}
                </div>
            </div>
        </button>
    );
};

export default FriendListItem;