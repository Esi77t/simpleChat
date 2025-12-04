import ChatWindow from "../components/ChatWindow";
import useAuth from "../hooks/useAuth";

const ChatRoomPage = ({ roomId, onLogout }) => {

    const { accountId, nickname } = useAuth();

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', background: '#f8f8f8', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>채팅방 : {roomId}</h3>
                <div>
                    <span style={{ marginRight: '10px' }}>계정 : {nickname} ({accountId})</span>
                    <button onClick={onLogout} style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>
                        로그아웃
                    </button>
                </div>
            </div>
            <div style={{ flexGrow: 1 }}>
                {/* useChatRoom 훅과 모든 채팅 로직이 실행되는 컴포넌트 */}
                <ChatWindow roomId={roomId} />
            </div>
        </div>
    );
}

export default ChatRoomPage;