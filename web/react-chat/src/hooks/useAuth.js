import { useEffect, useState } from "react"
import chatApi from "../api/chatApi";

const useAuth = () => {
    const [accountId, setAccountId] = useState(null);
    const [nickname, setNickname] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // localStorage에서 토큰과 사용자 정보 복구
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
            console.log(`[AUTH] 로그인 시도 : ${userId}`);

            const result = await chatApi.login(userId, password);

            if (result.success) {
                // 로컬 스토리지에 저장
                localStorage.setItem('accountId', result.userId);
                localStorage.setItem('nickname', result.nickname);
                localStorage.setItem('jwt_token', result.token);

                // 상태 업데이트
                setAccountId(result.userId);
                setNickname(result.nickname);
                setIsAuthenticated(true);

                console.log('[AUTH] 로그인 성공');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[AUTH] 로그인 실패 : ', error.message);
            throw error;
        }
    };

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