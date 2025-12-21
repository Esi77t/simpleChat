import { useCallback, useEffect, useRef, useState } from "react"
import SockJS from "sockjs-client";

const useStomp = (options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef({});    // 구독 정보를 저장해서 재구독에 사용할 것

    const { debug = false, onConnect, onError } = options;

    // STOMP 클라이언트 초기화, 연결
    const connect = useCallback(() => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            console.log('[STOMP] 이미 연결되어 있습니다.');
            return;
        };

        try {
            // SockJS를 사용해서 WebSocket 연결 시도
            const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws-chat'
            console.log(`[STOMP] ${wsUrl}에 연결 시도 중`);

            // SockJS 소켓 생성
            const socket = new SockJS(wsUrl);
            stompClientRef.current = Stomp.over(socket);

            // 디버그 모드 설정
            if (!debug) {
                stompClientRef.current.debug = () => { };
            }

            // JWT 토큰 가져오기
            const token = localStorage.getItem('jwt_token');
            const connectHeaders = {};
            if (token) {
                connectHeaders['Authorization'] = `Bearer ${token}`;
            }

            // STOMP 연결 시작
            stompClientRef.current.connect(
                connectHeaders,
                (frame) => {
                    console.log('[STOMP] 연결 성공 : ', frame);
                    setIsConnected(true);

                    // 연결 성공 콜백 실행
                    if (onConnect) {
                        onConnect(frame, stompClientRef.current);
                    }

                    // 저장된 구독 복구
                    Object.keys(subscriptionsRef.current).forEach((destination) => {
                        const { callback } = subscriptionsRef.current[destination];
                        subscribe(destination, callback);
                    });
                },
                (error) => {
                    console.error('[STOMP] 연결 실패 : ', error);
                    setIsConnected(false);
                    if (onError) {
                        onError(error);
                    }
                }
            );
        } catch (error) {
            console.error("[STOMP] 초기화 오류 : ", error);
            setIsConnected(false);
        }
    }, [debug, onConnect, onError]);

    // 채널 구독
    const subscribe = useCallback((destination, callback) => {
        if (!stompClientRef.current?.connected) {
            console.warn(`[STOMP] 연결 전이므로 ${destination} 구독 정보를 저장합니다.`);
            // 연결 전이라면 구독정보를 저장해두고 연결 후에 처리
            subscriptionsRef.current[destination] = { callback };
            return null;
        }

        try {
            console.log(`[STOMP] ${destination} 구독 시작`);
            const subscription = stompClientRef.current.subscribe(destination, (message) => {
                try {
                    const body = JSON.parse(message.body);
                    callback(body);
                } catch (error) {
                    console.error(`[STOMP] 메시지 파싱 오류 (${destination}) : `, error);
                }
            });

            subscriptionsRef.current[destination] = { callback, subscription };
            return subscription;
        } catch (error) {
            console.error(`[STOMP] 구독 오류 (${destination}} : `, error);
            return null;
        }
    }, []);

    // 구독 취소
    const unsubscribe = useCallback((destination) => {
        const sub = subscriptionsRef.current[destination];
        if (sub?.subscription) {
            sub.subscription.unsubscribe();
            delete subscriptionsRef.current[destination];
            console.log(`[STOMP] ${destination} 구독 취소`);
        }
    }, []);

    // 메시지 전송
    const send = useCallback((destination, body, headers = {}) => {
        if (stompClientRef.current?.connected) {
            try {
                stompClientRef.current.send(destination, headers, JSON.stringify(body));
                console.log(`[STOMP] 메시지 전송 (${destination}) : `, body);
            } catch (error) {
                console.error(`[STOMP] 메시지 전송 오류 (${destination}) : `, error);
            }
        } else {
            console.warn('[STOMP] 연결되지 않아 메시지를 전송할 수 없습니다.');
        }
    }, []);

    // 연결 해제
    const disconnect = useCallback(() => {
        if (stompClientRef.current) {
            try {
                // 모든 구독 취소
                Object.keys(subscriptionsRef.current).forEach((dest) => {
                    unsubscribe(dest);
                });

                if (stompClientRef.current.connected) {
                    stompClientRef.current.disconnect(() => {
                        console.log('[STOMP] 연결 해제 완료');
                        setIsConnected(false);
                        stompClientRef.current = null;
                    });
                } else {
                    stompClientRef.current = null;
                    setIsConnected(false);
                }
            } catch (error) {
                console.error('[STOMP] 연결 해제 오류 : ', error);
            }
        }
    }, [unsubscribe]);

    // 컴포넌트 마운트 시 연결, 언마운트 시 해제
    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { 
        isConnected, 
        subscribe, 
        unsubscribe, 
        send, 
        disconnect, 
        reconnect: connect, 
        client: stompClientRef.current 
    };
}

export default useStomp;