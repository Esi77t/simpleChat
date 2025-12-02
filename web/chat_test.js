<<<<<<< HEAD:web/ex/chat_test.js
// 글로벌 설정
const API_BASE_URL = "http://localhost:8080/api";
const WS_URL = "http://localhost:8080/ws";
<<<<<<< HEAD:web/ex/chat_test.js
const DEFAULT_ROOM_ID = "75daf69d-2d5a-4cad-9d45-2563bf191958"; // 별도의 입력 필드가 없으니까 기본 방을 하드코딩
=======
document.addEventListener('DOMContentLoaded', () => {
    // 글로벌 설정
    const API_BASE_URL = "http://localhost:8080/api";
    const WS_URL = "http://localhost:8080/ws";
    const DEFAULT_ROOM_ID = "ad71da59-8b33-4ebf-82fd-8cd401aa3020"; // 테스트용 기본 방 ID
>>>>>>> parent of 2489b4c (commit):web/chat_test.js
=======
const DEFAULT_ROOM_ID = "dcbd3c46-3b40-449e-a2ac-eaf4bdda8256"; // 별도의 입력 필드가 없으니까 기본 방을 하드코딩
>>>>>>> parent of 1ea7bfb (commit):web/chat_test.js

    // 상태 변수
    let AUTH_TOKEN = null;
    let STOMP_CLIENT = null;
    let CURRENT_USER_ID = null;
    let CURRENT_ACCOUNT_ID = null; // 읽음 확인 요청 시 필요
    let CURRENT_ROOM_ID = DEFAULT_ROOM_ID; // 기본 방으로 설정

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
    // const chatLog = getElement("chat-log");
    const sendBtn = getElement("send-btn");

    // 유틸리티 함수: 디버그용 로그 출력 (메시지 렌더링과 구분)
    function log(message, type = "system") {
        const chatLog = document.getElementById("chat-log")
        if (!chatLog) return;

        const p = document.createElement('p');
        p.className = `text-xs p-1 ${type === "system" ? "text-gray-500 italic" : "text-gray-900"
            } text-center`;
        p.textContent = `[${type.toUpperCase()}] ${message}`;
        chatLog.appendChild(p);
        chatLog.scrollTop = chatLog.scrollHeight;
    }


    // 로그인 및 인증 로직
    function handleLogin() {
        const userId = getElement("userId").value;
        const password = getElement("password").value;

        log("로그인 시도...", "system");

        fetch(API_BASE_URL + "/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, password })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || '로그인 실패'); });
                }
                return response.json();
            })
            .then(data => {
                // 응답 DTO (LoginResponse)에서 정보 추출
                AUTH_TOKEN = data.token;
                CURRENT_USER_ID = data.userId;
                CURRENT_ACCOUNT_ID = data.accountId; // 서버의 accountId 사용

                authStatus.textContent = `상태 : 로그인 성공 (${data.nickname})`;
                log(`[AUTH] 토큰 획득 완료. 닉네임: ${data.nickname}`, "system");

                // 로그인 성공 후 웹소켓 연결 시도
                connectWebSocket();
            })
            .catch(error => {
                authStatus.textContent = `상태 : 로그인 실패 - ${error.message}`;
                log(`[AUTH ERROR] ${error.message}`, "system");
            });
    }


    // 웹소켓 연결 로직
    function connectWebSocket() {
        if (STOMP_CLIENT && STOMP_CLIENT.connected) {
            log("[WS] 이미 연결되어 있습니다.", "system");
            return;
        }

        if (!AUTH_TOKEN) {
            log("[WS ERROR] JWT 토큰이 없어 연결할 수 없습니다.", "system");
            return;
        }

        log("[WS] 웹소켓 연결 시도...", "system");

        let socket = new SockJS(WS_URL);
        STOMP_CLIENT = Stomp.over(socket);

        // STOMP CONNECT 프레임에 Authorization 헤더를 담아 보낸다.
        const headers = {
            'Authorization': `Bearer ${AUTH_TOKEN}`
        };

        STOMP_CLIENT.connect(headers, onConnected, onError);
    }

    function onError(error) {
        log('[WS ERROR] 웹소켓 연결 실패: ' + error, "system");
        authStatus.textContent = `상태 : 연결 오류 - ${error}`;
        STOMP_CLIENT = null;
    }

    function onConnected(frame) {
        log("[WS] 연결 성공. STOMP Session ID: " + frame.headers.session, "system");

        chatSection.classList.remove('hidden');

        // 메인 채팅 채널 구독
        // STOMP subscribe 프레임에도 헤더를 넣어 보안을 강화합니다.
        const subscriptionHeaders = { 'Authorization': `Bearer ${AUTH_TOKEN}` };

        STOMP_CLIENT.subscribe(`/topic/chat/${CURRENT_ROOM_ID}`, onMessageReceived, subscriptionHeaders);
        log(`[SUBSCRIBE] 채팅방 구독 완료: ${CURRENT_ROOM_ID}`, "system");

        // 읽음 확인 업데이트 채널 구독
        STOMP_CLIENT.subscribe(`/topic/chat/${CURRENT_ROOM_ID}/read_update`, onReadReceiptUpdate, subscriptionHeaders);
        log(`[SUBSCRIBE] 읽음 업데이트 구독 완료: ${CURRENT_ROOM_ID}/read_update`, "system");

        // 로그인 섹션 숨기기
        loginSection.classList.add('hidden');
    }

    // 메시지 수신 및 렌더링 로직
    // 읽음 확인 업데이트 처리 함수
    function onReadReceiptUpdate(messageFrame) {
        const update = JSON.parse(messageFrame.body);
        const messageElement = document.getElementById(`msg-${update.messageId}`);

        if (!messageElement) {
            console.warn(`WARN: Read update received, but message DOM not yet rendered: ${update.messageId}`);
            return;
        }
        const readCountSpan = messageElement.querySelector('.read-count');

        if (readCountSpan) {
            readCountSpan.textContent = `읽음: ${update.readCount}`;
        }
    }

    // 메시지 수신 처리 함수
    function onMessageReceived(messageFrame) {
        try {
            const message = JSON.parse(messageFrame.body);

            console.log(`[RECEIVE] Type: ${message.type}, Sender: ${message.senderNickname || message.senderId}, Message: ${message.message}`);
            logMessageToDisplay(message);
        } catch (e) {
            // 파싱 오류 발생 시 디버깅
            console.error("FATAL ERROR: Failed to parse received message JSON.", e);
            console.error("Received body:", messageFrame.body);
        }
    }

    // 메시지 렌더링 함수 (기존 log 함수를 대체)
    function logMessageToDisplay(message) {
        const chatLog = document.getElementById("chat-log");
        if (!chatLog) return;

        const isSelf = message.senderId === CURRENT_USER_ID;
        const isSystem = message.type !== 'TALK';

        let timeStampString = message.timeStamp;
        timeStampString = timeStampString.replace(/(\.\d{3})\d+/, '$1');

        const date = new Date(timeStampString);

        if (isNaN(date.getTime())) {
            console.error("DEBUG ERROR: TimeStamp 파싱 실패. 원본:", message.timeStamp);
            return;
        }

        const time = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

        const messageDiv = document.createElement('div');
        messageDiv.id = `msg-${message.messageId}`;

        messageDiv.className = `p-2 my-2 rounded-lg max-w-[80%] shadow-md ${isSystem ? 'bg-gray-300 italic text-center mx-auto text-sm' :
            (isSelf ? 'bg-blue-500 text-white ml-auto' : 'bg-white mr-auto border border-gray-300')
            }`;

        if (isSystem) {
            // 시스템 메시지 렌더링
            messageDiv.innerHTML = `<span class="font-bold">[${message.type}]</span> ${message.message}`;
        } else {
            // 일반 채팅 메시지 렌더링
            messageDiv.innerHTML = `
            <div class="font-bold text-xs ${isSelf ? 'text-blue-200' : 'text-gray-600'}">${message.senderNickname}</div>
            <div class="message-content text-sm">${message.message}</div>
            <div class="flex ${isSelf ? 'justify-end' : 'justify-start'} text-[10px] opacity-75 mt-1">
                <span class="read-count mr-2">${isSelf ? `읽음: ${message.readCount}` : ''}</span>
                <span>${time}</span>
            </div>
        `;
        }

        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // 메시지 전송 및 읽음 확인 로직
    function sendMessage() {
        const input = getElement("message-input");
        const message = input.value.trim();

        if (!AUTH_TOKEN || !CURRENT_USER_ID) {
            log("[SEND ERROR] 로그인 또는 인증 상태를 확인하세요.", "system");
            return;
        }

        if (!message || !CURRENT_ROOM_ID || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
            log("[SEND ERROR] 메시지, 방 ID, 또는 WS 연결을 확인하세요.", "system");
            return;
        }

        const messagePayload = {
            roomId: CURRENT_ROOM_ID,
            senderId: CURRENT_USER_ID,
            type: "TALK",
            message: message
        };

        // /app/chat/send 경로로 전송. Authorization 헤더 포함
        STOMP_CLIENT.send(
            `/app/chat/send`,
            { 'Authorization': `Bearer ${AUTH_TOKEN}` },
            JSON.stringify(messagePayload)
        );
        // log(`[SEND] ${message}`, "self"); // 서버에서 메시지를 다시 받아 처리하므로 클라이언트에서 로그 찍는 것은 비활성화
        input.value = ''; // 입력창 초기화
    }

    // 읽음 확인 요청 로직
    function sendReadReceipt(messageId, roomId) {
        if (!messageId || !CURRENT_ACCOUNT_ID || !roomId || !STOMP_CLIENT || !STOMP_CLIENT.connected) {
            log("[READ ERROR] 읽음 확인 요청 실패: 정보 부족 또는 연결 끊김", "system");
            return;
        }

        const readReceiptPayload = {
            messageId: messageId,
            accountId: CURRENT_ACCOUNT_ID,
            roomId: roomId
        };

        // /app/chat/read 경로로 전송. Authorization 헤더 포함 (STOMP message frame에도 필요함)
        STOMP_CLIENT.send(
            `/app/chat/read`,
            { 'Authorization': `Bearer ${AUTH_TOKEN}` },
            JSON.stringify(readReceiptPayload)
        );
    }

    // 이벤트 리스너 등록 
    window.onload = () => {
        // 로그인 버튼 이벤트 리스너
        const loginBtn = getElement("login-btn");
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }

        // 메시지 전송 버튼 이벤트 리스너
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }

        // Enter 키로도 전송 가능하게 설정
        const messageInput = getElement("message-input");
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Enter 키 기본 동작 방지 (줄 바꿈)
                    sendBtn.click();
                }
            });
        }
    };
})