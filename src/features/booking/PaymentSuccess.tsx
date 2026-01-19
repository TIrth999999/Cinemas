import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import FilmStrip from "../../components/FilmStrip"
import '../../components/successFailure.css'

import { useToast } from '../../context/ToastContext'

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const sessionId = searchParams.get("session_id")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [orderId, setOrderId] = useState<string | null>(null)


    useEffect(() => {
        if (!sessionId) {
            setError("No Session ID found.")
            setLoading(false)
            return
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch(
                    `/api/payments/verify?session_id=${sessionId}`
                )

                if (res.ok) {
                    const data = await res.json()
                    setOrderId(data.orderId)
                    showToast("Payment verified successfully!", "success")
                    return
                }

                throw new Error("Verification endpoint returned error")

            } catch (err) {
                console.warn("Verification failed, checking recent orders...", err)
                try {
                    const token = localStorage.getItem('accessToken')
                    if (!token) throw new Error("No token for fallback")

                    const orderRes = await fetch("/api/orders", {
                        headers: { "Authorization": `Bearer ${token}` }
                    })

                    if (orderRes.ok) {
                        const orders = await orderRes.json()
                        // Sort by newest
                        orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

                        const latest = orders[0]
                        if (latest) {
                            const createdTime = new Date(latest.createdAt).getTime()
                            const now = Date.now()
                            if (now - createdTime < 5 * 60 * 1000) {
                                setOrderId(latest.id)
                                showToast("Payment confirmed (via recent orders)", "info")
                                return
                            }
                        }
                    }
                } catch (fallbackErr) {
                    console.error("Fallback failed", fallbackErr)
                }

                setError("Payment verification failed. Please check My Tickets to confirm.")
                showToast("Payment verification failed", "error")
            } finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [sessionId])


    if (loading) {
        return (
            <div className="payment-status-container">
                <FilmStrip animated={true} style={{ width: '250px' }}>
                    <h3>Verifying...</h3>
                </FilmStrip>
            </div>
        )
    }

    if (error) {
        return (
            <div className="payment-status-container">
                <div className="status-card">
                    <h1>Payment Error</h1>
                    <div className="icon-circle failure">
                        <div className="inner-circle failure">
                            {/* SVG X Icon */}
                            <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    <p>{error}</p>
                    <div className="action-buttons">
                        <button
                            className="btn-status btn-outline-gray"
                            onClick={() => navigate("/home")}
                        >
                            Back to Homepage
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="payment-status-container">
            <div className="status-card">
                <h1>Payment Successful</h1>

                <div className="icon-circle success">
                    <div className="inner-circle success">
                        <Check className="icon-svg" />
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        disabled={!orderId}
                        onClick={() => navigate(`/ticket/${orderId}`)}
                        className="btn-status btn-outline-blue"
                    >
                        View Ticket
                    </button>

                    <button
                        onClick={() => navigate("/home")}
                        className="btn-status btn-outline-gray"
                    >
                        Back to Homepage
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PaymentSuccess
