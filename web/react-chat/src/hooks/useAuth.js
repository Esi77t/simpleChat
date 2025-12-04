import axios from "axios";
import { useEffect, useState } from "react"

const AUTH_API_URL = "http://localhost:8080/api/v1/auth"

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
        try {
            const response = await axios.post(`${AUTH_API_URL}/login`, { userId, password });
            const receivedJwtToken = response.data.token;
            const actualAccountId = response.data.accountId;
            const actualNickname = response.data.nickname;

            localStorage.setItem('jwt_token', receivedJwtToken);
            localStorage.setItem('accountId', actualAccountId);
            localStorage.setItem('nickname', actualNickname);

            setAccountId(actualAccountId);
            setNickname(actualNickname);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Login failed: ", error);
            return false;
        }

        // // 임시 더미 데이터
        // const dummyAccountId = 'user-' + userId.toLowerCase();
        // const dummyNickname = userId;

        // const receivedJwtToken = 'mock-jwt-token-for' + userId;

        // // 성공했을 때
        // localStorage.setItem('accountId', dummyAccountId);
        // localStorage.setItem('nickname', dummyNickname);
        // localStorage.setItem('jwt_token', receivedJwtToken);

        // setAccountId(dummyAccountId);
        // setNickname(dummyNickname);
        // setIsAuthenticated(true);
        // return true;
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