import AuthForm from "../components/AuthForm";

const AuthPage = ({ type, onAuthSuccess, onNavigate }) => (
    <AuthForm 
        type={type} 
        onAuthSuccess={onAuthSuccess} 
        onNavigate={onNavigate} 
    />
);
export default AuthPage;