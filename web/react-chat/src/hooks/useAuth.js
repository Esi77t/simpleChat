import axios from "axios";
import { useEffect, useState } from "react"

const REAL_TOKEN_FOR_TESTING = "YOUR_ACTUAL_JWT_TOKEN_HERE";

const useAuth = () => {
    const [accountId, setAccountId] = useState(null);
    const [nickname, setNickname] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 새로고침을 하면 localstorage/sessionstorage에서 토큰과 사용자 정보를 복구
        const storedAccountId = localStorage.getItem('accountId');
        const storedNickname = localStorage.getItem('nickname');
        const storedToken = localStorage.getItem('jwt_token');

        if (storedAccountId && storedToken) {
            setAccountId(storedAccountId);
            setNickname(storedNickname);
            setIsAuthenticated(true);
        }
    }, []);

    // 로그인 함수 처리
    const login = async (userId, password) => {
        console.log(`[AUTH] 로그인 시도 : ${userId}`);

        // 실제 API 호출 로직으로 교체 예정
        const receivedJwtToken = (REAL_TOKEN_FOR_TESTING === "YOUR_ACTUAL_JWT_TOKEN_HERE") ? ('mock-jwt-token-for-' + userId) : REAL_TOKEN_FOR_TESTING;

        // 임시 더미 데이터
        const dummyAccountId = 'user-' + userId.toLowerCase();
        const dummyNickname = userId;

        // 성공했을 때
        localStorage.setItem('accountId', dummyAccountId);
        localStorage.setItem('nickname', dummyNickname);
        localStorage.setItem('jwt_token', receivedJwtToken);

        setAccountId(dummyAccountId);
        setNickname(dummyNickname);
        setIsAuthenticated(true);
        console.log(`[AUTH] 로그인 성공. 토큰 : ${receivedJwtToken.substring(0, 20)}...`);
        return true;
    }

    // 로그아웃 함수 처리
    const logout = async () => {
        localStorage.removeItem('accountId');
        localStorage.removeItem('nickname');
        localStorage.removeItem('jwt_token');
        setAccountId(null);
        setNickname(null);
        setIsAuthenticated(false);
        console.log("[AUTH] 로그아웃 완료");
    }

    return { accountId, nickname, isAuthenticated, login, logout };
}

export default useAuth;