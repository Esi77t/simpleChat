const RoomListItem = ({ room, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-lg transition-all ${isSelected
                ? 'bg-gray-700 text-white'
                : 'hover:bg-gray-700/50 text-gray-300'
                }`}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm truncate">{room.name}</span>
                {room.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                        {room.unread > 99 ? '99+' : room.unread}
                    </span>
                )}
            </div>
            {room.lastMessage && (
                <p className="text-xs text-gray-400 truncate">{room.lastMessage}</p>
            )}
        </button>
    );
}

export default RoomListItem;