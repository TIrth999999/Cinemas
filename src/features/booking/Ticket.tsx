import type { Order } from "../../types"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef, useEffect, useState } from "react"
import { CinemaFacadeGraphic } from "../../components/CinemaGraphics"
import { useParams, Link, useNavigate } from "react-router-dom"
import FilmStrip from "../../components/FilmStrip"
import '../../components/successFailure.css'

import { useToast } from '../../context/ToastContext'

type Props = {
    order?: Order | null
    showHomeButton?: boolean
}

const Ticket = ({ order: propOrder, showHomeButton }: Props) => {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState<Order | null>(propOrder || null)
    const [loading, setLoading] = useState(!propOrder)
    const [error, setError] = useState<string | null>(null)
    const { showToast } = useToast()

    useEffect(() => {
        if (propOrder) {
            setOrder(propOrder)
            setLoading(false)
            return
        }

        if (!orderId) {
            setLoading(false)
            return
        }

        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('accessToken')

                const res = await fetch("/api/orders", {
                    headers: { "Authorization": `Bearer ${token}` }
                })

                if (res.ok) {
                    const data: Order[] = await res.json()
                    const found = data.find(o => o.id === orderId)
                    if (found) setOrder(found)
                    else setError("Order not found")
                } else {
                    setError("Failed to load order")
                    showToast("Failed to load ticket details", "error")
                }
            } catch (err) {
                console.error(err)
                setError("Error loading ticket")
                showToast("Network error while loading ticket", "error")
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [propOrder, orderId, showToast])


    const pdfRef = useRef<HTMLDivElement>(null)

    const handleDownload = async () => {
        if (!pdfRef.current || !order) return

        try {
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 12
            const usableWidth = pageWidth - margin * 2
            const imgHeight = (canvas.height * usableWidth) / canvas.width
            const yPosition = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : margin

            pdf.addImage(imgData, "PNG", margin, yPosition, usableWidth, imgHeight)
            pdf.save(`CinemaS-Ticket-${order.id.slice(0, 8)}.pdf`)
            showToast("Ticket downloaded successfully!", "success")
        } catch (error) {
            console.error("PDF Generation failed", error)
            showToast("Failed to download ticket", "error")
        }
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FilmStrip animated={true} style={{ width: '250px' }}>
                <h6>Loading Ticket...</h6>
            </FilmStrip>
        </div>
    )

    if (error || !order) return (
        <div className="payment-status-container">
            <div className="status-card">
                <h3>Ticket Not Found</h3>
                <p>{error || "Invalid Ticket ID"}</p>
                <Link to="/home" className="btn-status btn-outline-gray">Go Home</Link>
            </div>
        </div>
    )

    const isPending = order.status === 'PENDING'
    const dateObj = new Date(order.showtime.startTime)
    const date = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
    const seats = order.seatData.seats.map(s => `${s.row}${s.column}`).join(", ")
    const seatCount = order.seatData.seats.length

    if (isPending) {
        return (
            <div className="ticket-card-wrapper">
                <div className="ticket-card pending-card" style={{ borderTop: '4px solid #f59e0b' }}>
                    <div className="ticket-header">
                        <span className="ticket-label">Status</span>
                        <span className="ticket-date" style={{ color: '#d97706' }}>Pending Payment</span>
                    </div>

                    <div className="ticket-movie">
                        <span className="ticket-label">Movie</span>
                        <span className="ticket-title" style={{ opacity: 0.7 }}>{order.showtime.movie.name}</span>
                    </div>

                    <div className="ticket-details">
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', margin: '20px 0' }}>
                            Your seats are reserved properly. Please complete the payment to generate the ticket.
                        </p>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px dashed #eee' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>ID: {order.id.slice(0, 8)}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="ticket-card-wrapper" style={{ margin: 'auto' }}>
            {/* Visible Simple Card */}
            <div className="ticket-card">
                <div className="ticket-header">
                    <span className="ticket-label">Date</span>
                    <span className="ticket-date">{weekday}, {date}</span>
                </div>

                <div className="ticket-movie">
                    <span className="ticket-label">Movie Title</span>
                    <span className="ticket-title">{order.showtime.movie.name}</span>
                </div>

                <div className="ticket-details">
                    <div className="detail-item">
                        <span className="ticket-type">Ticket ({seatCount})</span>
                        <span className="ticket-seats">{seats}</span>
                    </div>
                    <div className="detail-item right">
                        <span className="ticket-label-right">Hours</span>
                        <span className="ticket-time">{time}</span>
                    </div>
                </div>

                <button className="download-btn" onClick={handleDownload}>
                    Download Ticket
                </button>

                {showHomeButton && (
                    <button
                        className="download-btn"
                        style={{ marginTop: '10px', background: 'transparent', border: '1px solid #ddd', color: '#666' }}
                        onClick={() => navigate('/home')}
                    >
                        Back to Home
                    </button>
                )}
            </div>

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={pdfRef} className="pdf-ticket-template">
                    <div className="pdf-header">
                        <div className="pdf-logo">
                            <i className="fas fa-ticket-alt"></i> CinemaS
                        </div>
                        <div className="pdf-order-id">ORDER #{order.id.toUpperCase().slice(0, 8)}</div>
                    </div>

                    <div className="pdf-hero">
                        <CinemaFacadeGraphic className="pdf-hero-graphic" />
                        <div className="pdf-movie-info">
                            <h1>{order.showtime.movie.name}</h1>
                            <p>{order.showtime.screen.theaterName}</p>
                        </div>
                    </div>

                    <div className="pdf-body">
                        <div className="pdf-row">
                            <div className="pdf-col">
                                <label>DATE</label>
                                <span>{weekday}, {date}</span>
                            </div>
                            <div className="pdf-col">
                                <label>TIME</label>
                                <span>{time}</span>
                            </div>
                            <div className="pdf-col">
                                <label>SEATS ({seatCount})</label>
                                <span>{seats}</span>
                            </div>
                        </div>
                        <div className="pdf-row">
                            <div className="pdf-col">
                                <label>TOTAL PRICE</label>
                                <span>₹{order.totalPrice}</span>
                            </div>
                            <div className="pdf-col">
                                <label>SCREEN</label>
                                <span>Screen 1</span>
                            </div>
                        </div>
                    </div>

                    <div className="pdf-footer">
                        <div className="pdf-barcode">

                            {[...Array(40)].map((_, i) => (
                                <div key={i} style={{
                                    height: '40px',
                                    width: Math.random() > 0.5 ? '2px' : '4px',
                                    background: '#000',
                                    marginRight: '2px'
                                }}></div>
                            ))}
                        </div>
                        <p>Booking Confirmed • scan this code at the entrance</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Ticket
