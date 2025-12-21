const { default: axios } = require("axios");

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 : JWT 토큰을 자동으로 헤더에 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 : 401 에러 시 자동으로 로그아웃
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401) {
            // 토큰 만료 또는 인증 실패
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('accountId');
            localStorage.removeItem('nickname');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;