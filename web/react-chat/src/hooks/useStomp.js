import { useCallback, useEffect, useRef, useState } from "react"
import SockJS from "sockjs-client";

const Stomp = require('stompjs/lib/stomp').Stomp;

const useStomp = (wsUrl, options ={}) => {
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef({});    // 구독 정보를 저장해서 재구독에 사용할 것

    const { debug = false, onConnect } = options;
    const { login = "user", passcode = "password" } = options;

    // STOMP 클라이언트 초기화, 연결
    const connect = useCallback(() => {
        if (stompClientRef.current && stompClientRef.current.connected) return;

        try {
            // SockJS를 사용해서 WebSocket 연결 시도
            const socket = new SockJS(wsUrl);
            stompClientRef.current = Stomp.over(socket);

            if (!debug) {
                // 디버그 로그 끄기
                stompClientRef.current.debug = null;
            }

            const token = localStorage.getItem('jwt_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            stompClientRef.current.connect(
                { login, passcode },    // 헤더(인증정보)
                (frame) => {
                    setIsConnected(true);
                    if (onConnect) onConnect(frame, stompClientRef.current);

                    // 연결 성공 한 후에 이전에 저장된 구독목록을 복구
                    Object.keys(subscriptionsRef.current).forEach(topic => {
                        const callback = subscriptionsRef.current[topic].callback;
                        subscribe(topic, callback)
                    });
                },
                (error) => {
                    console.error("STOMP Connection Error : ", error);
                    setIsConnected(false);
                }
            );
        } catch (error) {
            console.error("WebSocket Initialization Error : ", error);
            setIsConnected(false);
        }
    }, [wsUrl, debug, onConnect]);

    // 채널 구독
    const subscribe = useCallback((topic, callback) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
            // 연결 전이라면 구독정보를 저장해두고 연결 후에 처리
            subscriptionsRef.current[topic] = { callback };
            return;
        }

        // 실제 STOMP 구독
        const subscription = stompClientRef.current.subscribe(topic, (message) => {
            try {
                const body = JSON.parse(message.body);
                callback(body);
            } catch (error) {
                console.error(`Error processing message from ${topic} : `, error);
            }
        });

        // 구독 정보 저장
        subscriptionsRef.current[topic] = { callback, subscription };
        return subscription;
    }, []);

    // 메시지 발행
    const send = useCallback((destination, body, headers = {}) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.send(destination, headers, JSON.stringify(body));
        } else {
            console.warn("STOMP client not connected. Message not sent");
        }
    }, []);

    // 연결 해제
    const disconnect = useCallback(() => {
        if (stompClientRef.current) {
            const client = stompClientRef.current;

            if (client.ws && client.ws.readyState === 1) {
                stompClientRef.current.disconnect(() => {
                    setIsConnected(false);
                    stompClientRef.current = null;
                    subscriptionsRef.current = {};
                });
            } else {
                setIsConnected(false);
                stompClientRef.current = null;
                subscriptionsRef.current = {};
            }

        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { isConnected, subscribe, send, disconnect, client: stompClientRef.current };
}

export default useStomp;