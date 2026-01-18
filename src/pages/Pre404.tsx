import { useNavigate } from 'react-router-dom'
import './pre404.css'

const Pre404 = () => {
    const navigate = useNavigate()

    return (
        <div className="pre404-container">
            <div className="pre404-content">
                <div className="film-strip">
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                </div>

                <div className="pre404-main">
                    <video src="loginMeme.mp4" autoPlay loop muted></video>

                    <button
                        className="pre404-btn"
                        onClick={() => navigate('/')}
                    >
                        <i className="fas fa-sign-in-alt"></i>
                        Go to Login
                    </button>
                </div>

                <div className="film-strip film-strip-right">
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                    <div className="film-hole"></div>
                </div>
            </div>
        </div>
    )
}

export default Pre404
