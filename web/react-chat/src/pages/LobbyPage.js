import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import MessageBox from "../components/MessageBox";
import chatApi from "../api/chatApi";

const LobbyPage = ({ navigate }) => {
    const { accountId, nickname, logout } = useAuth();
    const [roomName, setRoomName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            setRoomsLoading(true);
            try {
                const token = localStorage.getItem('jwt_token');
                const result = await chatApi.getRooms(token);
                if (result.success) {
                    setRooms(result.rooms);
                } else {
                    setMessage({ type: 'error', text: '채팅방 목록을 불러오지 못했습니다.' });
                }
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
                setMessage({ type: 'error', text: '서버 통신 오류로 목록을 불러올 수 없습니다.' });
            } finally {
                setRoomsLoading(false);
            }
        };

        fetchRooms();
    }, []); 

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!roomName.trim()) {
            setMessage({ type: 'error', text: '방 제목을 입력해주세요.' });
            return;
        }

        setCreateLoading(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const result = await chatApi.createRoom(roomName, token); 

            setMessage({ type: 'success', text: result.message });
            setRoomName('');

            if (result.success) {
                const newRoom = {
                    id: result.roomId, 
                    name: roomName, 
                    users: 1, 
                    creator: nickname
                };
                setRooms(prev => [newRoom, ...prev]);
            }

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || '채팅방 생성 중 오류 발생' });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEnterRoom = (roomId, roomName) => {
        console.log(`[NAVIGATION] ${roomId} 채팅방으로 이동.`);
        navigate('chat', { roomId, roomName }); // ChatPage로 이동
    };

    const renderRoomList = () => {
        if (roomsLoading) {
            return (
                <div className="empty-list-placeholder list-loading">
                    <div className="spinner-large"></div>
                    <p>채팅방 목록을 불러오는 중입니다...</p>
                </div>
            );
        }

        if (rooms.length === 0) {
            return (
                <div className="empty-list-placeholder">
                    <p>현재 활성화된 채팅방이 없습니다. 새 채팅방을 만들어보세요!</p>
                </div>
            );
        }

        return (
            <ul className="rooms-list">
                {rooms.map(room => (
                    <li key={room.id} className="room-item">
                        <div className="room-info">
                            <span className="room-name">{room.name}</span>
                            <span className="room-creator">개설자: {room.creator}</span>
                        </div>
                        <div className="room-users">
                            👥 {room.users}명
                        </div>
                        <button 
                            className="room-enter-button" 
                            onClick={() => handleEnterRoom(room.id, room.name)}
                        >
                            입장
                        </button>
                    </li>
                ))}
            </ul>
        );
    };
    

    return (
        <div className="rooms-container flex-col-space-y-6">
            <header className="rooms-header">
                <h1 className="rooms-title rooms-title-color">채팅방 로비</h1>
                <div className="flex-items-center space-x-4">
                    <span className="user-info-text">
                        👋 {nickname} ({accountId})
                    </span>
                    <button 
                        onClick={logout}
                        className="logout-button"
                    >
                        로그아웃
                    </button>
                </div>
            </header>

            {message && <MessageBox message={message.text} type={message.type} onClose={() => setMessage(null)} />}
            
            {/* 채팅방 생성 섹션 */}
            <div className="create-room-section">
                <h2 className="section-title rooms-title-color">새 채팅방 만들기</h2>
                <form onSubmit={handleCreateRoom} className="flex-space-x-3">
                    <input
                        type="text"
                        placeholder="방 제목을 입력하세요 (예: 테스트방)"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="input-field flex-grow"
                        required
                    />
                    <button
                        type="submit"
                        disabled={createLoading}
                        className="primary-button rooms-button-color"
                    >
                        {createLoading ? (
                            <div className="spinner"></div>
                        ) : '생성'}
                    </button>
                </form>
            </div>

            {/* 채팅방 목록 섹션 */}
            <div className="rooms-list-area">
                <h2 className="section-title list-title-color">활성 채팅방 목록</h2>
                {renderRoomList()}
            </div>
        </div>
    );
}

export default LobbyPage;