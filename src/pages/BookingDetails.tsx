import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './bookingDetails.css'
import { useToast } from '../context/ToastContext.tsx'

const BookingDetails = () => {

    const location = useLocation()
    const state = location.state

    // No local payment UI state needed anymore
    // const [showPayment, setShowPayment] = useState(false) 

    const totalPrice: number = state?.totalPrice || 0;
    const selectedSeats: { seat: string; layoutType: string }[] = state?.bookedSeats || [];
    const movieName: string = state?.movieName || 'Unknown Movie';
    const startTime: string = state?.time || '';
    const date: string = state?.date || '';
    const serviceChargePercent = 6;
    const serviceCharge = Math.round(totalPrice * (serviceChargePercent / 100));
    const finalTotal = totalPrice + serviceCharge;

    const navigate = useNavigate()
    const previousUrl: string | undefined = location.state?.from
    const showId: string = location.state?.showId

    const { showToast } = useToast()

    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) {
                showToast("Not authenticated. Please login again.", "error")
                return
            }

            const payload = {
                showtimeId: showId,
                seatData: {
                    seats: selectedSeats.map(s => ({
                        row: s.seat.charAt(0),
                        column: Number(s.seat.slice(1)),
                        layoutType: s.layoutType,
                    })),
                },
            }

            const res = await fetch(
                'http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/orders',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            )

            const data = await res.json()

            if (!res.ok || !data.paymentUrl) {
                throw new Error(data.message || 'Payment initiation failed')
            }

            const redirectUrl = new URL(data.paymentUrl)
            redirectUrl.searchParams.set("orderId", data.orderId)
            window.location.href = data.paymentUrl

        } catch (err) {
            console.error(err)
            showToast('Unable to initiate payment. Please try again.', 'error')
        }
    }


    useEffect(() => {
        if (!state || !state.showId) {
            showToast("Invalid booking session. Please select seats again.", "error")
            navigate('/home')
        }
    }, [state, navigate, showToast])

    if (!state || !state.showId) {
        return null // Render nothing while redirecting
    }


    return (
        <div className="booking-container">
            <div className='ticketCard'>
                <h2>Booking Detail</h2>

                <div className="ticket-section movie-title">
                    <h3>Movie Title</h3>
                    <p>{movieName}</p>
                </div>

                <div className="ticket-section date">
                    <h3>Date</h3>
                    <p>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>

                <div className="ticket-row">
                    <div className="ticket-section">
                        <h3>Ticket ({selectedSeats.length})</h3>
                        <p>{selectedSeats.map(e => e.seat).join(', ')}</p>
                    </div>
                    <div className="ticket-section">
                        <h3>Hours</h3>
                        <p>{startTime}</p>
                    </div>
                </div>

                <div className="ticket-divider"></div>

                <h4 className="transaction-header">Transaction Detail</h4>

                <div className="price-row">
                    <span>{selectedSeats.length} SEAT(s)</span>
                    <span>₹{totalPrice}</span>
                </div>

                <div className="price-row">
                    <span>Service Charge ({serviceChargePercent}%)</span>
                    <span>₹ {serviceCharge}</span>
                </div>

                <div className="price-row total">
                    <span>Total payment</span>
                    <span>₹ {finalTotal}</span>
                </div>

                <p className="footer-notice">*Purchased ticket cannot be canceled</p>

                <button
                    className="proceed-btn"
                    onClick={handlePayment}
                >
                    Total Pay ₹{finalTotal} Proceed
                </button>

                <button
                    className="cancel-btn"
                    onClick={() => {
                        if (previousUrl) navigate(previousUrl)
                        else navigate(-1)
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    )

}

export default BookingDetails