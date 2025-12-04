import logo from './logo.svg';
import './App.css';
import useAuth from './hooks/useAuth';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatRoomPage from './pages/ChatRoomPage';

function App() {
    const { isAuthenticated, accountId, login, logout } = useAuth();

    // 임시방
    const hardcodedRoomId = "a134e343-8274-4521-a1da-af6e22a2b7a7";
    
    return (
        <Router>
            <div style={{ height: '100vh '}}>
                <Routes>
                    {/* 로그인 페이지 : 인증된 경우 채팅방으로 리다이렉트 */}
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/chat" /> : <LoginPage login={login} /> }
                    />
                    {/* 채팅방 페이지 : 인증되지 않은 경우 로그인 페이지로 리다이렉트 */}
                    <Route
                        path="/chat"
                        element={isAuthenticated ? (
                            <ChatRoomPage
                                roomId={hardcodedRoomId}
                                currentAccountId={accountId}
                                onLogout={logout}
                            />
                        ) : (
                            <Navigate to="/login" />
                        )}
                    />
                    {/*  기본경로는 채팅방으로 설정함 */}
                    <Route
                        path="*"
                        element={<Navigate to="/chat" />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
