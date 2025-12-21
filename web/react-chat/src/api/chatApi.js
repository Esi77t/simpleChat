import axiosInstance from "./axiosInstance";

const chatApi = {
    // 회원가입
    signup: async ({ userId, password, nickname }) => {
        try {
            const response = await axiosInstance.post('/api/auth/register', {
                userId,
                password,
                nickname,
            });
            return {
                success: true,
                message: response.data || '회원가입이 성공적으로 완료되었습니다.'
            };
        } catch (error) {
            const message = error.response?.data || '회원가입에 실패했습니다.';
            throw new Error(message);
        }
    },

    // 로그인
    login: async (userId, password) => {
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                userId,
                password,
            });

            const { token, nickname, userId: returnedUserId } = response.data;

            return {
                success: true,
                token,
                userId: returnedUserId,
                nickname,
            };
        } catch (error) {
            const message = error.response?.data || '로그인에 실패했습니다.';
            throw new Error(message);
        }
    },

    // 내 정보 조회
    getMyInfo: async () => {
        try {
            const response = await axiosInstance.get('/api/users/me');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || '사용자 정보를 불러올 수 없습니다.');
        }
    },

    // 채팅방 생성
    createRoom: async (name, password = null) => {
        try {
            const response = await axiosInstance.post('/api/rooms', {
                name,
                password,
            });
            return {
                success: true,
                room: response.data,
                message: `채팅방 [${name}]이 성공적으로 생성되었습니다.`,
            };
        } catch (error) {
            const message = error.response?.data || '채팅방 생성이 실패했습니다.';
            throw new Error(message);
        }
    },

    // 채팅방 목록 조회
    getRooms: async (page = 0, size = 20) => {
        try {
            const response = await axiosInstance.get('/api/rooms', {
                params: { page, size },
            });
            return {
                success: true,
                rooms: response.data,
            };
        } catch (error) {
            throw new Error(error.response?.data || '채팅방 목록을 불러올 수 없습니다.');
        }
    },

    // 특정 채팅방 조회
    getRoom: async (roomId) => {
        try {
            const response = await axiosInstance.get(`/api/rooms/${roomId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || '채팅방 정보를 불러올 수 없습니다.');
        }
    },

    // 채팅방 비밀번호 확인
    checkRoomPassword: async (roomId, password) => {
        try {
            const response = await axiosInstance.post(
                `/api/rooms/${roomId}/check-password`,
                null,
                { params: { password } }
            );
            return response.data;   // true 아니면 false로
        } catch (error) {
            throw new Error(error.response?.data || '비밀번호 확인에 실패했습니다.');
        }
    },

    // 채팅방 메시지 이력 조회
    getMessageHistory: async (roomId, page = 0, size = 30) => {
        try {
            const response = await axiosInstance.get(
                `/api/messages/${roomId}/history`,
                { params: { page, size }}
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || '메시지 이력을 불러올 수 없습니다.');
        }
    },

    // 회원 탈퇴
    deleteAccount: async () => {
        try {
            await axiosInstance.delete('/api/users/me');
            return { success: true };
        } catch (error) {
            throw new Error(error.response?.data || '회원 탈퇴에 실패했습니다.');
        }
    },
};

export default chatApi;