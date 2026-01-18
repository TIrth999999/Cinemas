import { useNavigate } from 'react-router-dom'
import './pre404.css'

const Pre404 = () => {
    const navigate = useNavigate()

    return (
        <div className="pre404-container">
            <div className="pre404-content">
                <h1 className="pre404-title">404</h1>
                <h2 className="pre404-subtitle">Page Not Found</h2>
                <p className="pre404-text">
                    The page you are looking for does not exist or has been moved.
                </p>
                <button
                    className="pre404-btn"
                    onClick={() => navigate('/')}
                >
                    <i className="fas fa-arrow-left"></i>
                    Back to Login
                </button>
            </div>
        </div>
    )
}

export default Pre404
