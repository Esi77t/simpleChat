import { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSendMessage, isConnected = true, disabled = false }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && !disabled && isConnected) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const placeholder = disabled
        ? '메시지를 보낼 수 없습니다'
        : !isConnected
            ? '연결 대기 중...'
            : '채팅을 입력해주세요';

    return (
        <div className="p-6">
            <div className="relative">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled || !isConnected}
                    className="w-full bg-gray-800 text-white px-6 py-4 pr-14 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled || !isConnected}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors"
                    aria-label="메시지 전송"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;