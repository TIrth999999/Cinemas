import { createContext, useContext, useEffect, useRef, useState } from "react"
import FilmStrip from '../components/FilmStrip'
import { useNavigate } from "react-router-dom"
import { useToast } from '../context/ToastContext.tsx'

type AuthContextType = {
    token: string | null
    email: string | null
    isAuthenticated: boolean
    login: (token: string, expireAt: number, email: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { showToast } = useToast()
    const isHandlingUnauthorized = useRef(false)

    // Listen for axios 401 events
    useEffect(() => {
        const handleUnauthorized = () => {
            // If already handling an unauthorized event, ignore subsequent ones
            if (isHandlingUnauthorized.current) return;

            isHandlingUnauthorized.current = true;
            showToast("Session expired. Please login again.", "error")
            logout()
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [showToast]);

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken")
        const expireAt = localStorage.getItem("expireAt")
        const storedEmail = localStorage.getItem("userEmail")

        if (storedToken && expireAt) {
            const now = Math.floor(Date.now() / 1000)

            if (now < Number(expireAt)) {
                setToken(storedToken)
                if (storedEmail) setEmail(storedEmail)
                setIsAuthenticated(true)
            } else {
                localStorage.removeItem("accessToken")
                localStorage.removeItem("expireAt")
                localStorage.removeItem("userEmail")
            }
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        const expireAt = localStorage.getItem("expireAt")
        if (!isAuthenticated || !expireAt) return

        const expirationTimeMs = Number(expireAt) * 1000
        const nowMs = Date.now()
        const timeoutDuration = expirationTimeMs - nowMs

        if (timeoutDuration <= 0) {
            showToast("Session expired. Please login again.", "info")
            logout()
        }

        console.log(`Auto-logout scheduled in ${timeoutDuration / 1000} seconds`)

        const timer = setTimeout(() => {
            showToast("Session expired. Please login again.", "info")
            logout()
        }, timeoutDuration)

        return () => clearTimeout(timer)
    }, [isAuthenticated, token, showToast])

    const login = (newToken: string, expireAt: number, userEmail: string) => {
        localStorage.setItem("accessToken", newToken)
        localStorage.setItem("expireAt", expireAt.toString())
        localStorage.setItem("userEmail", userEmail)

        setToken(newToken)
        setEmail(userEmail)
        setIsAuthenticated(true)

        // Reset the flag so we can handle 401s again after login
        isHandlingUnauthorized.current = false
    }

    const logout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("expireAt")
        localStorage.removeItem("userEmail")

        setToken(null)
        setEmail(null)
        setIsAuthenticated(false)
        navigate("/login")
    }

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <FilmStrip animated={true} style={{ width: '250px' }}>
                    <h6 style={{ color: '#fff', margin: 0 }}>Loading...</h6>
                </FilmStrip>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ token, email, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}