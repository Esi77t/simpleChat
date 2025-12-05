const MessageBox = ({ message, type, onClose }) => {
    const baseClass = "message-box";
    const typeClass = type === 'error' ? 'message-error' : 'message-success';

    return (
        <div
            className={`${baseClass} ${typeClass}`}
            role="alert"
        >
            <div className="flex-items-center">
                <p>{message}</p>
                {onClose && (
                    <button onClick={onClose} className="message-close-btn">
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
}

export default MessageBox;