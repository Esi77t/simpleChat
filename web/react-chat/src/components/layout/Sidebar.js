import { LogOut, MessageCircle, Plus, Settings, Users, X } from "lucide-react";
import FriendListItem from "../chat/FreindListItem";
import RoomListItem from "../chat/RoomListItem";

const Sidebar = ({
    isOpen,
    onClose,
    currentUser,
    rooms = [],
    friends = [],
    selectedRoomId,
    onRoomSelect,
    onCreateRoom,
    onLogout
}) => {
    return (
        <div className={`${isOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-gray-800 flex flex-col overflow-hidden`}>
            {/* 사이드바 헤더 */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-start">
                <button
                    onClick={onClose}
                    className="p-2 horver:bg-gray-700 rounded-lg transition-colors"
                    aria-label="사이드바 닫기"
                >
                    <X size={20} />
                </button>
            </div>
            {/* 채팅방 생성 버튼 */}
            <div className="p-4">
                <button
                    onClick={onCreateRoom}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus size={18} />
                    새 채팅방 만들기
                </button>
            </div>
            {/* 스크롤 가능한 리스트 영역 */}
            <div className="flex-1 overflow-y-auto">
                {/* 채팅방 섹션 */}
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm font-semibold">
                        <MessageCircle size={16} />
                        <span>채팅방</span>
                    </div>
                    <div className="space-y-1">
                        {rooms.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                참여 중인 채팅방이 없습니다
                            </p>
                        ) : (
                            rooms.map(room => (
                                <RoomListItem
                                    key={room.id}
                                    room={room}
                                    isSelected={selectedRoomId === room.id}
                                    onClick={() => onRoomSelect(room.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
                {/* 친구 섹션 */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm font-semibold">
                        <Users size={16} />
                        <span>친구</span>
                    </div>
                    <div className="space-y-1">
                        {friends.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                친구가 없습니다
                            </p>
                        ) : (
                            friends.map(friend => (
                                <FriendListItem
                                    key={friend.id}
                                    friend={friend}
                                    onClick={() => console.log('친구 클릭:', friend.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
                {/* 사용자 프로필 (하단 고정) */}
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-xl">
                                {currentUser?.avatar || '👤'}
                            </div>
                            <div>
                                <div className="font-medium text-sm">{currentUser?.nickname || '사용자'}</div>
                                <div className="text-xs text-gray-400">{currentUser?.userId || 'user'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="설정"
                            >
                                <Settings size={18} className="text-gray-400" />
                            </button>
                            <button
                                onClick={onLogout}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="로그아웃"
                            >
                                <LogOut size={18} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;