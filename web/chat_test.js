// 글로벌 설정
const API_BASE_URL = "http://localhost:8080/api";
const WS_URL = "http://localhost:8080/ws";
const DEFAULT_ROOM_ID = "dcbd3c46-3b40-449e-a2ac-eaf4bdda8256"; // 별도의 입력 필드가 없으니까 기본 방을 하드코딩

// 상태 변수
let AUTH_TOKEN = null;
let STOMP_CLIENT = null;
let CURRENT_USER_ID = null;
let CURRENT_ACCOUNT_ID = null;
let CURRENT_ROOM_ID = null;
let PROCESSED_READ_UPDATES = new Set();

// DOM 요소 헬퍼 함수
const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`ERROR: DOM element with ID "${id}" not found.`);
    }
    return element;
};

// DOM 요소 로드
const authStatus = getElement("auth-status");
const loginSection = getElement("login-section");
const chatSection = getElement("chat-section");
const chatLog = getElement("chat-log");

// 유틸리티 함수: 로그 출력
function log(message, type = "system") {
    if (!chatLog) return;
    
    const p = document.createElement('p');
    // 새로운 HTML 구조에 맞게 스타일 조정
    p.className = `text-xs p-1 ${
        type === "system" ? "text-blue-600 italic" : 
        (type === "self" ? "text-blue-700 font-medium text-right" : "text-gray-800 text-left")
    }`;
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// 로그인 로직
const loginBtn = getElement("login-btn");
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const userIdInput = getElement("userId");
        const passwordInput = getElement("password");

        if (!userIdInput || !passwordInput) return;

        const userId = userIdInput.value;
        const password = passwordInput.value;

        if (!userId || !password) {
            if(authStatus) authStatus.textContent = "상태 : ID와 비밀번호를 입력하세요.";
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

            if (authStatus) {
                authStatus.textContent = `상태 : 성공, 닉네임: ${data.nickname}`;
                authStatus.className = "mt-2 text-sm text-green-600 font-bold";
            }
            
            // 로그인 성공 후 UI 전환: login-section 숨기고 chat-section 표시
            if (loginSection) loginSection.classList.add("hidden");
            if (chatSection) chatSection.classList.remove("hidden");

            log(`[AUTH] 사용자 ${data.nickname}로 로그인 성공`);
            connectWebSocket(); // 웹소켓 연결 시도
        } catch (error) {
            if (authStatus) {
                authStatus.textContent = `상태 : 로그인 실패 - ${error.message}`;
                authStatus.className = "mt-2 text-sm text-red-600 font-bold";
            }
            log(`[AUTH ERROR] ${error.message}`);
        }
    });
}

// 웹소켓 연결 로직
function connectWebSocket() {
    if (STOMP_CLIENT && STOMP_CLIENT.connected) return;

    log("[WS] 웹소켓 연결 시도");
    
    const socket = new SockJS(WS_URL);
    STOMP_CLIENT = Stomp.over(socket);
    STOMP_CLIENT.debug = null;

    const headers = {
        "Authorization": `Bearer ${AUTH_TOKEN}`
    };

    STOMP_CLIENT.connect(headers, (frame) => {
        log("[WS] STOMP 연결 성공. 자동 채팅방 입장 시도...");
        joinChatRoom(DEFAULT_ROOM_ID); // 연결 성공 시 기본 방에 자동 입장
    }, (error) => {
        log(`[WS ERROR] 연결 실패 : ${error}`, "system");
    });
}

// 채팅방 입장 및 구독 로직 (자동 입장)
function joinChatRoom(roomId) {
    if (!roomId || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
        log("[JOIN ERROR] 유효하지 않은 방 ID 또는 WS 연결 상태가 아닙니다.", "system");
        return;
    }

    CURRENT_ROOM_ID = roomId;

    // 채팅 메시지 구독
    STOMP_CLIENT.subscribe(`/topic/chat/${roomId}`, (message) => {
        try {
            const body = JSON.parse(message.body);
            displayMessage(body);

            // 읽음 확인 요청조건 강화
            const isSelf = body.senderId === CURRENT_USER_ID;
            const isTalk = body.type === "TALK";

            if (isTalk && !isSelf) {
                sendReadReceipt(body.messageId, body.roomId);
            }

            // 읽음 확인 로직
            sendReadReceipt(body.messageId, body.roomId);
        } catch (e) {
            log(`[PARSE ERROR] 메시지 처리 실패: ${e.message}`, "system");
        }
    });

    STOMP_CLIENT.subscribe(`/topic/chat/${roomId}/read_update`, (readUpdateMessage) => {
        try {
            const updateBody = JSON.parse(readUpdateMessage.body);
            updateReadCount(updateBody.messageId, updateBody.readCount);
        } catch (error) {
            log(`[READ UPDATE ERROR] 읽음 수 업데이트 처리 실패 : ${error.message}`, "system");
        }
    });

    log(`[JOIN] 채팅방 ${roomId}에 자동 입장 및 구독 성공. 메시지 수신 대기 중`, "system");
}

// 메시지 표시 함수
function displayMessage(message) {
    if (!message.senderNickname || !message.message) {
        log("[DISPLAY ERROR] 메시지 형식 오류", "system");
        return;
    }

    let type = (message.senderId === CURRENT_USER_ID) ? "self" : "other";

    // 메시지 형식 : [발신자 닉네임] 메시지 내용 [읽음수]
    const readCountDisplay = message.readCount !== undefined ? ` [읽음:${message.readCount}]` : '';
    const messageText = `${message.senderNickname} : ${message.message}${readCountDisplay}`;
    log(messageText, type);
}

// 메시지 전송 로직
const sendBtn = getElement("send-btn");
if (sendBtn) {
    sendBtn.addEventListener('click', () => {
        const input = getElement("message-input");
        if (!input) {
            log("[SEND ERROR] Message input field not found.", "system");
            return;
        }

        const message = input.value.trim();

        if (!message || !CURRENT_ROOM_ID || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
            // 이 오류가 뜨면 CURRENT_ROOM_ID가 설정되었는지 확인
            log("[SEND ERROR] 메시지, 방 ID, 또는 WS 연결을 확인하세요.", "system");
            return;
        }

        const messagePayload = {
            roomId: CURRENT_ROOM_ID,
            senderId: CURRENT_USER_ID, 
            type: "TALK", 
            message: message
        };

        // /app/chat/send 경로로 전송
        STOMP_CLIENT.send(`/app/chat/send`, { Authorization: `Bearer ${AUTH_TOKEN}` }, JSON.stringify(messagePayload));
        // log(`[SEND] ${message}`, "self");
        input.value = ''; // 입력창 초기화
    });
    
    // Enter 키로도 전송 가능하게 설정
    const messageInput = getElement("message-input");
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }
}

// 읽음 확인 요청 로직
function sendReadReceipt(messageId, roomId) {
    console.log(`[DEBUG] Attempting to send ReadReceipt for: ${messageId}`);
    if (!messageId || !CURRENT_ACCOUNT_ID || !roomId || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
        return;
    }

    const readPayload = {
        messageId: messageId,
        accountId: CURRENT_ACCOUNT_ID, 
        roomId: roomId 
    }

    STOMP_CLIENT.send(`/app/chat/read`, { Authorization: `Bearer ${AUTH_TOKEN}` }, JSON.stringify(readPayload));
}

function updateReadCount(messageId, newReadCount) {

    if (PROCESSED_READ_UPDATES.has(messageId + ":" + newReadCount)) {
        console.log(`[DEBUG_SKIP] Already processed update for: ${messageId}`);
        return;
    }

    PROCESSED_READ_UPDATES.add(messageId + ":" + newReadCount);

    log(`[READ UPDATE] 메시지 ID ${messageId} 읽음 수 : ${newReadCount}로 업데이트 요청 수신`, "system");
}