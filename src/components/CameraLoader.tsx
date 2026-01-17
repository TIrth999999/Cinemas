import React, { useEffect, useState } from "react"
import "./cameraLoader.css"
interface CameraLoaderProps { intro?: boolean; onComplete?: () => void }
const CameraLoader: React.FC<CameraLoaderProps> = ({ intro = false, onComplete }) => {
    const [count, setCount] = useState(3)
    const [angle, setAngle] = useState(0)
    useEffect(() => {
        if (!intro) return
        const t = setInterval(() => { setCount(p => { if (p <= 1) { clearInterval(t); setTimeout(() => onComplete?.(), 500); return 1 } return p - 1 }) }, 1e3)
        return () => clearInterval(t)
    }, [intro, onComplete])
    useEffect(() => {
        if (!intro) return
        const s = setInterval(() => setAngle(a => (a + 6) % 360), 16)
        return () => clearInterval(s)
    }, [intro])
    return (
        <div className={`camera-loader-wrapper ${intro ? "intro-mode" : ""}`}>
            {intro && <>
                <div className="film-grain" />
                <div className="vignette" />
                <div className="scratch-line" />
                <div className="scratch-line" />
            </>}
            <div className="intro-stack">
                <div className="dial-wrapper">
                    <div style={{ position: "absolute", inset: 0, background: "conic-gradient(rgba(0,0,0,.25) 0deg,transparent 60deg)", transform: `rotate(${angle}deg)` }} />
                    <div className="cross-h" />
                    <div className="cross-v" />
                    <div className="ring r1" />
                    <div className="ring r2" />
                    {intro && <div className="dial-count">{count}</div>}
                </div>

                {/* <div className="camera-assembly insta-flip">
                    <div className="reels">
                        <div className={intro ? "reel fast-spin" : "reel"} />
                        <div className={intro ? "reel fast-spin" : "reel"} />
                    </div>

                    <div className="camera-main">
                        <div className="insta-body">
                            <div className="insta-lens" />
                            <div className="insta-flash" />
                            {intro && <div className="light-beam" />}
                        </div>
                    </div>
                </div> */}

                <h6 className="loading-text">{intro ? "STARTING PRODUCTION..." : "LOADING..."}</h6>
            </div>
        </div>
    )
}
export default CameraLoader
