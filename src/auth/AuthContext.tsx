import { createContext, useContext, useEffect, useState } from "react"
import FilmStrip from '../components/FilmStrip'
import { useNavigate } from "react-router-dom"
import { useToast } from '../context/ToastContext.tsx'

type AuthContextType = {
    token: string | null
    isAuthenticated: boolean
    login: (token: string, expireAt: number) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { showToast } = useToast()

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken")
        const expireAt = localStorage.getItem("expireAt")

        if (storedToken && expireAt) {
            const now = Math.floor(Date.now() / 1000)

            if (now < Number(expireAt)) {
                setToken(storedToken)
                setIsAuthenticated(true)
            } else {
                localStorage.removeItem("accessToken")
                localStorage.removeItem("expireAt")
            }
        }

        setLoading(false)
    }, [])

    useEffect(() => {
        const expireAt = localStorage.getItem("expireAt")
        if (!expireAt) return

        const timeout = Number(expireAt) * 1000 - Date.now()

        if (timeout <= 0) {
            showToast("Session expired. Please login again.", "info")
            logout()
            return
        }

        const timer = setTimeout(() => {
            showToast("Session expired. Please login again.", "info")
            logout()
        }, timeout)
        return () => clearTimeout(timer)
    }, [token, showToast])



    const login = (token: string, expireAt: number) => {
        localStorage.setItem("accessToken", token)
        localStorage.setItem("expireAt", expireAt.toString())

        setToken(token)
        setIsAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("expireAt")

        setToken(null)
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
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}