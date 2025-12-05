import { useState } from "react";
import MessageBox from "./MessageBox";
import useAuth from "../hooks/useAuth";
import chatApi from "../api/chatApi";

const AuthForm = ({ type, onAuthSuccess, onNavigate }) => {
    const isLogin = type === 'login';
    const title = isLogin ? '로그인' : '회원가입';
    const titleColorClass = isLogin ? 'login-title-color' : 'signup-title-color';
    const buttonColorClass = isLogin ? 'login-button-color' : 'signup-button-color';
    const linkColorClass = isLogin ? 'login-link-color' : 'signup-link-color';
    const navigateTo = isLogin ? 'signup' : 'login';
    const linkText = isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?';
    const linkButtonText = isLogin ? '회원가입' : '로그인';

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            if (isLogin) {
                const success = await login(userId, password);
                if (success) {
                    onAuthSuccess();
                }
            } else {
                const result = await chatApi.signup({ userId, password, nickname });
                if (result.success) {
                    setMessage({ type: 'success', text: result.message + " 이제 로그인 페이지로 이동합니다." });
                    setTimeout(() => onNavigate('login'), 2000);
                } else {
                    setMessage({ type: 'error', text: result.message || '회원가입에 실패했습니다.' });
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || '서버 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className={`form-container ${isLogin ? 'login-form-color' : 'signup-form-color'} space-y-4`}>
            <h2 className={`form-title ${titleColorClass}`}>{title}</h2>

            {message && <MessageBox message={message.text} type={message.type} onClose={() => setMessage(null)} />}

            <input
                type="text"
                placeholder="사용자 ID (userId)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="input-field"
                required
            />
            {!isLogin && (
                <input
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input-field"
                    required
                />
            )}
            <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className={`primary-button ${buttonColorClass}`}
            >
                {loading ? (
                    <div className="spinner"></div>
                ) : title}
            </button>
            <p className="form-link-text">
                {linkText}
                <button type="button" onClick={() => onNavigate(navigateTo)} className={`form-link-btn ${linkColorClass}`}>
                    {linkButtonText}
                </button>
            </p>
        </form>
    );
}

export default AuthForm;