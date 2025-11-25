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
document.getElementById("login-btn").addEventListener('click', async () => {
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
    const headers = {
        "Authorization": `Bearer ${AUTH_TOKEN}`
    };

    STOMP_CLIENT.connect(headers, (frame) => {
        wsStatus.textContent = "WS 연결 상태 : 연결됨";
        wsStatus.className = "mt-2 text-sm text-green-600 font-bold";
        log("[ws] STOMP 연결 성공");

        // 연결 성공 후 채팅방 구독을 위한 이벤트 리스너 활성화
        document.getElementById("join-btn").addEventListener('click', joinChatRoom, { once: true });
    }, (error) => {
        wsStatus.textContent = `WS 연결 상태 : 연결 오류 - ${error}`;
        wsStatus.className = "mt-2 text-sm text-red-600 font-bold";
        log(`[WS ERROR] 연결 실패 : ${error}`);
    });
}

// 채팅방 입장, 구독 로직
function joinChatRoom() {
    const roomId = document.getElementById("roomIdInput").value;
    if (!roomId || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
        log("[JOIN ERROR] 유효하지 않은 방 ID 또는 WS 연결 상태가 아닙니다.");
        return;
    }

    CURRENT_ROOM_ID = roomId;
    currentRoomStatus.textContent = `현재 방 : ${roomId} (구독 중)`;

    // 채팅 메시지 구독
    STOMP_CLIENT.subscribe(`/topic/chat/${roomId}`, (message) => {
        const body = JSON.parse(message.body);
        displayMessage(body);

        // 읽음 확인 로직
        // 메시지 수신 즉시 읽음 확인 요청 전송
        sendReadReceipt(body.messageId, body.roomId);
    });

    log(`[JOIN] 채팅방 ${roomId} 구독 성공. 메시지 수신 대기 중`);
}

// 메시지 표시 함수
function displayMessage(message) {
    let type = "other";
    if (message.senderId === CURRENT_USER_ID) {
        type = "self";
    }

    // 메시지 형식 : [발신자 닉네임] 메시지 내용
    const messageText = `${message.senderNickname} [읽음:${message.readCount}] : ${message.message}`;
    log(messageText, type);
}

// 메시지 전송 로직
document.getElementById("send-btn").addEventListener('click', () => {
    const input = document.getElementById("message-input");
    const message = input.value.trim();

    if (!message || !CURRENT_ROOM_ID || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
        log("[SEND ERROR] 메시지, 방 ID, 또는 WS 연결을 확인하세요.", "system");
        return;
    }

    // 서버의 @MessageMapping("/chat/send")로 메시지 전송
    const messagePayload = {
        roomId: CURRENT_ROOM_ID,
        senderId: CURRENT_USER_ID,  // 백엔드에서 인증 정보와 비교
        type: "TALK",   // MessageType.TALK
        message: message
    };

    // /app/{destination} 경로로 전송
    STOMP_CLIENT.send(`/app/chat/send`, {}, JSON.stringify(messagePayload));
    log(`[SEND] 보냄 : ${message}`, "self");
    input.value = '';   // 입력창 초기화
});

// 읽음 확인 요청 로직
function sendReadReceipt(messageId, roomId) {
    if (!messageId || !CURRENT_ACCOUNT_ID || !roomId || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
        return;
    }

    const readPayload = {
        messageId: messageId,
        accountId: CURRENT_ACCOUNT_ID,  // DB 엔티티 ID
        roomId: roomId                  // 브로드캐스팅용
    }

    // 서버의 @MessageMapping("/chat/read")로 전송
    STOMP_CLIENT.send(`/app/chat/read`, {}, JSON.stringify(readPayload));
}