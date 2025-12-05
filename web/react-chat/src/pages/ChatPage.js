const ChatPage = ({ roomId, roomName, navigate }) => {
    // 현재는 플레이스홀더입니다.
    return (
        <div className="chat-page-container">
            <header className="chat-header">
                <button onClick={() => navigate('rooms')} className="back-button">
                    &larr; 로비로 돌아가기
                </button>
                <h1 className="chat-title">{roomName}</h1>
                <div className="chat-users-count">채팅방 ID: {roomId}</div>
            </header>
            
            <div className="chat-window-placeholder">
                <p>실제 채팅 기능 구현 예정</p>
                <p>이곳에 채팅 메시지 목록과 입력창이 표시됩니다.</p>
                <p className="small-text">현재 구조: [pages] ChatPage.js</p>
            </div>
        </div>
    );
};

export default ChatPage;