import { useEffect, useState } from "react"

const useAuth = () => {
    const [accountId, setAccountId] = useState(null);
    const [nickname, setNickname] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 새로고침을 하면 localstorage/sessionstorage에서 토큰과 사용자 정보를 복구
        const storedAccountId = localStorage.getItem('accountId');
        const storedNickname = localStorage.getItem('nickname');

        if (storedAccountId) {
            setAccountId(storedAccountId);
            setNickname(storedNickname);
            setIsAuthenticated(true);
        }
    }, []);

    // 로그인 함수 처리
    const login = async (userId, password) => {
        // 임시 더미 데이터
        const dummyAccountId = 'user-' + userId.toLowerCase();
        const dummyNickname = userId;

        // 성공했을 때
        localStorage.setItem('accountId', dummyAccountId);
        localStorage.setItem('nickname', dummyNickname);

        setAccountId(dummyAccountId);
        setNickname(dummyNickname);
        setIsAuthenticated(true);
        return true;
    }

    // 로그아웃 함수 처리
    const logout = async () => {
        localStorage.removeItem('accountId');
        localStorage.removeItem('nickname');
        setAccountId(null);
        setNickname(null);
        setIsAuthenticated(false);
    }

    return { accountId, nickname, isAuthenticated, login, logout };
}

export default useAuth;