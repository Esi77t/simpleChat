import logo from './logo.svg';
import './App.css';
import useAuth from './hooks/useAuth';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function App() {
    const { isAuthenticated, accountId, login, logout } = useAuth();

    // 임시방
    const hardcodedRoomId = "room1";
    
    return (
        <Router>
            <div style={{ height: '100vh '}}>
                <Routes>
                    {/* 로그인 페이지 : 인증된 경우 채팅방으로 리다이렉트 */}

                </Routes>
            </div>
        </Router>
    );
}

export default App;
