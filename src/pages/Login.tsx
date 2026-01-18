import './login.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from "../auth/AuthContext"
import { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isAuthenticated } = useAuth()
    const { showToast } = useToast()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)



    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || "/home"
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, location])

    const authenticate = async () => {
        // Basic frontend validation
        if (!email || !password) {
            showToast("Please enter email and password", "warning")
            return
        }

        // Email format validation
        const emailRegex = /^\S+@\S+\.\S+$/
        if (!emailRegex.test(email)) {
            showToast("Please enter a valid email address", "error")
            return
        }

        try {
            const res = await fetch(
                "/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            )

            const result = await res.json()

            // Handle all error responses including 401
            if (!res.ok) {
                if (res.status === 401) {
                    showToast("Invalid email or password", "error")
                } else {
                    showToast(result.message || "Login failed", "error")
                }
                return
            }

            const { accessToken, expireAt } = result.data

            login(accessToken, expireAt)
            showToast("Login Successful!", "success")

            const from = location.state?.from?.pathname || "/home"
            navigate(from, { replace: true })

        } catch (err) {
            console.error(err)
            showToast("Something went wrong. Try again.", "error")
        }
    }

    return (
        <>
            <div className="loginContainer">
                <div className='loginLeft'>
                    <img src='logo.png' width={150} alt="Logo" />
                    <br />
                    <div>
                        <h1>
                            Welcome.
                            <br />
                            Begin your cinematic adventure now with our ticketing platform!
                        </h1>
                    </div>
                </div>

                <div className='loginRight'>
                    <div>
                        <h2>Login To Your Account</h2>
                    </div>

                    <div>
                        <p>Email</p>
                        <input
                            id='email'
                            required
                            type='email'
                            name='email'
                            placeholder='Enter Your Email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="passwordBox" id='passBox'>
                        <p>Password</p>
                        <input
                            id='password'
                            required
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter Your Password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <i
                            className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>

                    <div>
                        <button type='button' onClick={authenticate}>Login</button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p>
                            Don't Have An Account?{" "}
                            <a href='#' style={{ color: '#1090DF' }} onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
                                Register Here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login