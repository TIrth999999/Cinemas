import { useEffect, useState } from 'react'
import './signup.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../context/ToastContext'

const Signup = () => {

    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { showToast } = useToast()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home')
        }
    }, [isAuthenticated, navigate])

    const [fName, setfName] = useState('')
    const [lName, setlName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const register = async () => {

        if (!fName || !lName || !email || !password) {
            showToast("Please Enter All Details", "warning")
            return
        }

        const emailRegex = /^\S+@\S+\.\S+$/
        if (!emailRegex.test(email)) {
            showToast("Please enter a valid email address", "error")
            return
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        if (!passwordRegex.test(password)) {
            showToast(
                "Password must be at least 8 characters long, include uppercase, lowercase, and a number",
                "error"
            )
            return
        }

        try {
            const res = await fetch(
                "http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ firstName: fName, lastName: lName, email, password }),
                }
            )

            const result = await res.json()

            if (!res.ok) {
                showToast(result.message || "Registration failed", "error")
                return
            }


            showToast("Registration Successful! Please Login Now", "success")
            setfName('')
            setlName('')
            setEmail('')
            setPassword('')
            // navigate("/")
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
                        <h2>Create An Account</h2>
                    </div>
                    <div>
                        <p>First Name</p>
                        <input
                            id='fName'
                            required
                            type='text'
                            name='fName'
                            placeholder='Enter Your First Name'
                            value={fName}
                            onChange={e => setfName(e.target.value)}
                        />
                    </div>
                    <div>
                        <p>Last Name</p>
                        <input
                            id='lName'
                            required
                            type='text'
                            name='lName'
                            placeholder='Enter Your Last Name'
                            value={lName}
                            onChange={e => setlName(e.target.value)}
                        />
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
                            name='password'
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
                        <button type='submit' onClick={register}>Sign Up</button>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p>
                            Already Have An Account?{" "}
                            <a href='#' style={{ color: '#1090DF' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                                Log In
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup