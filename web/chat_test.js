// 글로벌 변수
const API_BASE_URL = "http://localhost:8080/api";
const WS_URL = "http://localhost:8080/ws";

let AUTH_TOKEN = null;
let STOMP_CLIENT = null;
let CURRENT_USER_ID = null;
let CURRENT_ACCOUNT_ID = null;
let CURRENT_ROOM_ID = null;

// DOM 요소
const authStatus = document.getElementById("auth-status");
const wsStatus = document.getElementById("ws-status");
const loginSection = document.getElementById("login-section");
const chatInfoSection = document.getElementById("chat-info-section");
const chatSection = document.getElementById("chat-section");
const chatLog = document.getElementById("chat-log");
const currentRoomStatus = document.getElementById("current-room-stauts");

// 유틸리티 함수
function log(message, type = "system") {
    const p = document.createElement('p');
    p.className = `text-sm ${type === "system" ? "text-purple-600 italic" : (type === "self" ? "text-blue-600 font-medium" : "text-gray-800")}`;
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// 로그인 로직
document.getElementById("login-btn").addEventListener('click', async() => {
    const userId = document.getElementById("userId").value;
    const password = document.getElementById("password").value;

    if (!userId || !password) {
        authStatus.textContent = "상태 : ID와 비밀번호를 입력하세요.";
        return;
    }

    try {
        log(`[AUTH] 로그인 시도 중 ID : ${userId}`);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "로그인 실패");
        }

        const data = await response.json();
        AUTH_TOKEN = data.token;
        CURRENT_USER_ID = data.userId;
        CURRENT_ACCOUNT_ID = data.accountId;

        authStatus.textContent = `상태 : 성공, 토큰 : ${AUTH_TOKEN.substring(0, 15)}...`;
        authStatus.className = "mt-2 text-sm text-red-600 font-bold";

        // 로그인 성공 후 다음 섹션 표시
        loginSection.classList.add("hidden");
        chatInfoSection.classList.remove("hidden");
        chatSection.classList.remove("hidden");

        log(`[AUTH] 사용자 ${data.nickname}로 로그인 성공`);
        connectWebSocket();
    } catch (error) {
        authStatus.textContent = `상태 : 로그인 실패 - ${error.message}`;
        authStatus.className = "mt-2 text-sm text-red-600 font-bold";
        log(`[AUTH ERROR] ${error.message}`);
    }
})

// 웹소켓 연결 로직
function connectWebSocket() {
    if (STOMP_CLIENT && STOMP_CLIENT.connected) return;

    log("[WS] 웹소켓 연결 시도");
    wsStatus.textContent = "WS 연결 상태 : 연결 시도 중";
    wsStatus.className = "mt-2 text-sm text-yellow-600";

    const socket = new SockJS(WS_URL);
    STOMP_CLIENT = Stomp.over(socket);

    // STOMP 연결 시 JWT를 헤더에 담아 보낸다
}