import logo from './logo.svg';
import './App.css';
import useAuth from './hooks/useAuth';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import ChatPage from './pages/ChatPage';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PretendardStyles = `
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");

    body {
        font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif !important;
    }
`;

const CustomStyles = `
    /* -------------------- 5.1. 전역 레이아웃 스타일 -------------------- */
    .app-root {
        min-height: 100vh;
        background-color: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }
    .rooms-container, .chat-page-container {
        width: 100%;
        height: 100%;
        max-width: 64rem; 
        padding: 2rem; 
        background-color: white;
        border-radius: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem; 
    }
    
    /* -------------------- 5.2. Form 공통 스타일 -------------------- */
    .form-container {
        width: 100%;
        max-width: 24rem;
        padding: 1.5rem;
        background-color: white;
        border-radius: 0.75rem;
        margin-top: 1rem;
    }
    .form-title { font-size: 1.875rem; font-weight: 700; text-align: center; margin-bottom: 1.5rem; }
    .input-field { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box; }
    .primary-button { width: 100%; padding: 0.75rem; font-size: 1.125rem; font-weight: 600; color: white; border-radius: 0.5rem; transition: background-color 0.3s; display: flex; justify-content: center; align-items: center; border: none; cursor: pointer; }
    .primary-button:disabled { opacity: 0.5; cursor: not-allowed; }
    .form-link-text { text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 1rem; }
    .form-link-btn { font-weight: 600; margin-left: 0.25rem; transition: color 0.3s; background: none; border: none; padding: 0; cursor: pointer; }

    /* Login & Signup Specific Colors */
    .login-title-color { color: #4338ca; }
    .login-button-color { background-color: #4f46e5; }
    .login-button-color:hover:not(:disabled) { background-color: #4338ca; }
    .login-link-color { color: #4f46e5; }
    .login-link-color:hover { color: #3730a3; }
    .input-field:focus { outline: 2px solid #4f46e5; border-color: #4f46e5; }
    
    .signup-title-color { color: #047857; }
    .signup-button-color { background-color: #059669; }
    .signup-button-color:hover:not(:disabled) { background-color: #047857; }
    .signup-link-color { color: #059669; }
    .signup-link-color:hover { color: #065f46; }
    .signup-form-color .input-field:focus { outline: 2px solid #059669; border-color: #059669; }


    /* -------------------- 5.3. LobbyPage (Rooms) 스타일 -------------------- */
    .rooms-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
    .rooms-title { font-size: 1.875rem; font-weight: 800; }
    .rooms-title-color { color: #4338ca; }
    .user-info-text { font-size: 1rem; color: #4b5563; font-weight: 500; }
    .logout-button { padding: 0.5rem 1rem; background-color: #ef4444; color: white; border: none; border-radius: 0.5rem; transition: background-color 0.2s; cursor: pointer; }
    .logout-button:hover { background-color: #dc2626; }
    .create-room-section { border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.75rem; background-color: #eef2ff; }
    .section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; }
    .rooms-button-color { padding: 0.75rem 1.5rem; background-color: #4f46e5; color: white; font-weight: 600; border-radius: 0.5rem; transition: background-color 0.3s; }
    .rooms-button-color:hover:not(:disabled) { background-color: #4338ca; }
    .list-title-color { color: #374151; }
    .empty-list-placeholder { padding: 1rem; background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 0.5rem; text-align: center; color: #6b7280; }
    .list-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100px; }
    .rooms-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .room-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
    .room-item:hover { 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
    .room-info { flex-grow: 1; display: flex; flex-direction: column; margin-right: 1rem; }
    .room-name { font-weight: 700; font-size: 1.125rem; color: #1f2937; }
    .room-creator { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
    .room-users { font-weight: 600; color: #4f46e5; margin-right: 1rem; min-width: 50px; text-align: right; }
    .room-enter-button { padding: 0.5rem 1rem; background-color: #10b981; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
    .room-enter-button:hover { background-color: #059669; }

    /* -------------------- 5.4. ChatPage 스타일 -------------------- */
    .chat-page-container {
        max-width: 80rem; 
        height: 80vh; /* 채팅창은 높이가 고정되어야 스크롤이 자연스러움 */
        padding: 0; /* 채팅창 레이아웃을 위해 패딩 제거 */
        gap: 0;
        overflow: hidden;
    }
    .chat-header {
        display: flex;
        align-items: center;
        padding: 1rem;
        background-color: #4f46e5;
        color: white;
        z-index: 10;
        border-radius: 0.75rem 0.75rem 0 0;
    }
    .chat-title {
        flex-grow: 1;
        text-align: center;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 1rem;
    }
    .back-button {
        padding: 0.5rem 1rem;
        background: none;
        border: 1px solid white;
        color: white;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: background-color 0.2s;
        font-weight: 600;
    }
    .back-button:hover { background-color: #6366f1; }
    .chat-users-count {
        font-size: 0.875rem;
        opacity: 0.8;
    }
    .chat-window-placeholder {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f7f7f7;
        color: #9ca3af;
        text-align: center;
        padding: 2rem;
        border-radius: 0 0 0.75rem 0.75rem;
    }
    .small-text { font-size: 0.75rem; margin-top: 1rem; }


    /* -------------------- 5.5. Utility Classes & Animations -------------------- */
    .space-y-4 > * + * { margin-top: 1rem; }
    .flex-col-space-y-6 > * + * { margin-top: 1.5rem; }
    .flex-items-center { display: flex; align-items: center; }
    .flex-space-x-4 > * + * { margin-left: 1rem; }
    .flex-space-x-3 > * + * { margin-left: 0.75rem; }
    .flex-grow { flex-grow: 1; }
    /* Message Box, Spinner styles remain unchanged */
    .message-box { position: fixed; top: 1rem; left: 50%; transform: translateX(-50%); padding: 1rem; border-radius: 0.5rem; z-index: 50; display: flex; align-items: center; justify-content: space-between; min-width: 250px; }
    .message-error { background-color: #ef4444; color: white; }
    .message-success { background-color: #10b981; color: white; }
    .message-close-btn { margin-left: 1rem; color: white; font-weight: 700; opacity: 0.7; transition: opacity 0.2s; background: none; border: none; padding: 0; cursor: pointer; font-size: 1.5rem; line-height: 1; }
    .message-close-btn:hover { opacity: 1; }
    .spinner { display: inline-block; width: 1.25rem; height: 1.25rem; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.2); border-bottom-color: #fff; animation: spin 1s linear infinite; }
    .spinner-large { display: inline-block; width: 2rem; height: 2rem; border-radius: 50%; border: 4px solid rgba(100, 116, 139, 0.2); border-bottom-color: #4f46e5; animation: spin 1s linear infinite; margin-bottom: 0.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
`;

function App() {
    const { isAuthenticated } = useAuth();
    // currentPage: 'login', 'signup', 'rooms', 'chat'
    const [currentPage, setCurrentPage] = useState('login'); 
    const [pageParams, setPageParams] = useState({}); // 채팅방 ID 등을 저장

    // 인증 상태에 따라 페이지 자동 전환
    useEffect(() => {
        if (isAuthenticated) {
            // 로그인 상태지만 아직 chat 페이지로 가지 않았다면 rooms로 이동
            if (currentPage !== 'chat') {
                setCurrentPage('rooms');
            }
        } else {
            setCurrentPage('login');
        }
    }, [isAuthenticated]);

    const navigate = useCallback((page, params = {}) => {
        setCurrentPage(page);
        setPageParams(params);
    }, []);

    const renderPage = useMemo(() => {
        switch (currentPage) {
            case 'login':
                return <AuthPage 
                    type="login" 
                    onAuthSuccess={() => navigate('rooms')} 
                    onNavigate={navigate} 
                />;
            case 'signup':
                return <AuthPage type="signup" onNavigate={navigate} />;
            case 'rooms':
                return <LobbyPage navigate={navigate} />;
            case 'chat':
                return <ChatPage 
                    roomId={pageParams.roomId} 
                    roomName={pageParams.roomName} 
                    navigate={navigate} 
                />;
            default:
                return <AuthPage type="login" onAuthSuccess={() => navigate('rooms')} onNavigate={navigate} />;
        }
    }, [currentPage, pageParams, navigate]);

    return (
        <>
            <style>{PretendardStyles}</style> 
            <style>{CustomStyles}</style>
            <div className="app-root">
                {renderPage}
            </div>
        </>
    );
}

export default App;
