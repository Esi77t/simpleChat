const { useState } = require("react")

const LoginPage = ({ login }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userId && password) {
            login(userId, password);
        }
    }

    return (
        <div style={{ padding: '50px', maxWidth: '300px', margin: '0 auto' }}>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    placeholder="사용자 ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
                />
                <input 
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
                />
                <button type="submit" style={{ padding: '10px', width: '100%', background: '#007bff', color: 'white' }}>
                    로그인
                </button>
            </form>
        </div>
    );
}

export default LoginPage;