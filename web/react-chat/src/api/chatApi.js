import axios from "axios";

const mockRooms = [
    { id: 'room-1', name: '일반 채팅방 (1)', users: 15, creator: 'admin' },
    { id: 'room-2', name: '자유 토론방 (2)', users: 7, creator: 'user-alice' },
    { id: 'room-3', name: '기술 Q&A (3)', users: 22, creator: 'user-bob' },
    { id: 'room-4', name: 'React 개발 스터디 (4)', users: 10, creator: 'user-charlie' },
];

const chatApi = {
    signup: async ({ userId, password, nickname }) => {
        console.log(`[API] 회원가입 시도 : ${userId}, ${nickname}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (userId === 'admin') {
                    resolve({ success: false, message: "이미 존재하는 사용자 ID입니다." });
                } else {
                    resolve({ success: true, message: `${nickname}님, 회원가입에 성공했습니다. 로그인 해주세요.` });
                }
            }, 500);
        });
    },

    createRoom: async (roomName, token) => {
        console.log(`[API] 채팅방 생성시도 : ${roomName}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (roomName.length < 3) {
                    reject({ status: 400, message: "방 제목은 최소 3글자 이상이어야 합니다." });
                } else if (roomName.includes("비밀")) {
                    reject({ status: 403, message: "채팅방 생성 권한이 없습니다. (Mock 403 Test)" });
                } else {
                    resolve({
                        success: true,
                        roomId: 'new-room-' + Math.random().toString(36).substring(2, 9),
                        message: `채팅방 [${roomName}]이 성공적으로 생성되었습니다.`
                    });
                }
            }, 800);
        });
    },

    getRooms: async (token) => {
        console.log(`[API] 채팅방 목록 조회 시도. Token : ${token ? token.substring(0, 10) + '...' : 'N/A'}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, rooms: mockRooms });
            }, 1000);
        });
    }
}

export default chatApi;