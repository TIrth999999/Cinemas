import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import FilmStrip from './FilmStrip'
import './screenPage.css'
import type { LayoutBlock, PriceType } from '../types'

import { useToast } from '../context/ToastContext.tsx'

type SelectedSeat = {
    seat: string
    layoutType: string
}

type ShowType = {
    movie: { name: string }
    startTime: string
    price: PriceType[]
    screen: any
}

const ScreenPage = () => {
    const navigate = useNavigate()
    const { showId } = useParams<{ showId: string }>()
    const location = useLocation()
    const seatLimit: number = location.state?.seats || 1
    const previousUrl: string | undefined = location.state?.from
    // Capture theater details passed from previous page
    const theaterNameState = location.state?.theaterName
    const theaterLocationState = location.state?.theaterLocation

    const token = localStorage.getItem('accessToken')

    const [layout, setLayout] = useState<LayoutBlock[]>([])
    const [prices, setPrices] = useState<PriceType[]>([])
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
    const [show, setShow] = useState<ShowType | null>(null)
    const [bookedSeatsSet, setBookedSeatsSet] = useState<Set<string>>(new Set())

    const { showToast } = useToast()

    const isDragging = useRef(false)
    const dragMode = useRef<'select' | 'deselect' | null>(null)

    // Handle global pointer up to stop dragging
    useEffect(() => {
        const handleGlobalPointerUp = () => {
            isDragging.current = false
            dragMode.current = null
        }
        window.addEventListener('pointerup', handleGlobalPointerUp)
        return () => window.removeEventListener('pointerup', handleGlobalPointerUp)
    }, [])

    useEffect(() => {
        if (!token || !showId) return

        fetch(
            `http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/show-times/${showId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(res => res.json())
            .then(res => {
                const showData = res?.data
                if (!showData) return

                setShow(showData)
                setPrices(showData.price)

                const rawLayout = showData.screen.layout

                const parsedLayout =
                    typeof rawLayout === 'string'
                        ? JSON.parse(rawLayout)
                        : rawLayout

                setLayout(parsedLayout)

                const booked = new Set<string>()

                showData.orders?.forEach((order: any) => {
                    order.seatData?.seats?.forEach((seat: any) => {
                        booked.add(`${seat.row}${seat.column}`)
                    })
                })

                setBookedSeatsSet(booked)
            })
            .catch(err => {
                console.error('Fetch failed', err)
                showToast("Failed to load screen layout", "error")
            })
    }, [showId, token, showToast])


    const getLayoutTypeForSeat = (seat: string): string => {
        const row = seat[0]
        const section = layout.find(sec => sec.layout.rows.includes(row))
        return section?.type || ''
    }

    const toggleSeat = (seat: string, forceMode?: 'select' | 'deselect') => {
        if (bookedSeatsSet.has(seat)) return

        setSelectedSeats(prev => {
            const exists = prev.some(s => s.seat === seat)

            // Determine action: forceMode takes precedence, otherwise toggle
            const shouldSelect = forceMode ? forceMode === 'select' : !exists

            if (shouldSelect) {
                // Prevent selecting if already selected or limit reached
                if (exists) return prev
                if (prev.length >= seatLimit) return prev

                const sectionType = getLayoutTypeForSeat(seat)
                if (!sectionType) return prev

                // CRITICAL: Ensure layoutType matches one of the price categories 
                // to avoid "Invalid layout type" errors from the backend.
                const validPriceCategory = prices.find(p => p.layoutType === sectionType)
                const layoutType = validPriceCategory ? validPriceCategory.layoutType : (prices[0]?.layoutType || sectionType)

                return [...prev, { seat, layoutType }]
            } else {
                // Deselect
                if (!exists) return prev
                return prev.filter(s => s.seat !== seat)
            }
        })
    }

    const handlePointerDown = (e: React.PointerEvent, seat: string) => {
        e.preventDefault() // Prevent text selection/scrolling start
        if (bookedSeatsSet.has(seat)) return

        isDragging.current = true

        // Check if currently selected to determine mode for this drag session
        const isSelected = selectedSeats.some(s => s.seat === seat)
        dragMode.current = isSelected ? 'deselect' : 'select'

        // Apply immediately to the start seat
        toggleSeat(seat, dragMode.current)
    }

    const handlePointerEnter = (seat: string) => {
        if (!isDragging.current || !dragMode.current) return
        toggleSeat(seat, dragMode.current)
    }

    const getPriceForType = (layoutType: string) => {
        const priceObj = prices.find(p => p.layoutType === layoutType)
        return priceObj?.price || prices[0]?.price || 0
    }

    const totalPrice = selectedSeats.reduce((sum, s) => sum + getPriceForType(s.layoutType), 0)
    const seatsLeft = seatLimit - selectedSeats.length

    if (!layout.length || !show) return (
        <div className="loading-container" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FilmStrip animated={true} style={{ width: '250px' }}>
                <h6>Loading...</h6>
            </FilmStrip>
        </div>
    )

    const bookingData = {
        totalPrice,
        bookedSeats: selectedSeats,
        movieName: show.movie.name,
        date: new Date(show.startTime).toLocaleDateString(),
        time: new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showId: showId
    }

    return (
        <div className="screen-container">
            <div className='screen-heading'>
                <a
                    onClick={() => {
                        if (previousUrl) {
                            navigate(previousUrl, {
                                state: {
                                    theaterName: theaterNameState,
                                    theaterLocation: theaterLocationState
                                }
                            })
                        } else {
                            navigate(-1)
                        }
                    }}
                >
                    <i className='fas fa-arrow-left'></i>
                </a>
                <h2>Select Seats {seatsLeft > 0 && `(${seatsLeft})`}</h2>
            </div>

            <div className='seats'>
                {layout.map(section => {
                    const price = getPriceForType(section.type)

                    return (
                        <div key={section.type} className="seat-section">
                            <h6>₹{price} {section.type}</h6>
                            <hr />
                            {section.layout.rows.map(row => (
                                <div key={row} className="seat-row">
                                    {Array.from({ length: section.layout.columns[1] }, (_, i) => {
                                        const seat = `${row}${i + 1}`
                                        const isSelected = selectedSeats.some(s => s.seat === seat)
                                        const isBooked = bookedSeatsSet.has(seat)
                                        return (
                                            <button
                                                key={seat}
                                                disabled={isBooked}
                                                onPointerDown={(e) => handlePointerDown(e, seat)}
                                                onPointerEnter={() => handlePointerEnter(seat)}
                                                style={{
                                                    cursor: isBooked ? 'not-allowed' : 'pointer',
                                                    touchAction: 'none', // Prevent scrolling while dragging
                                                    backgroundColor: isBooked
                                                        ? '#444'
                                                        : isSelected
                                                            ? '#4caf50'
                                                            : '#fff',
                                                    color: isBooked ? '#aaa' : '#000',
                                                    border: isBooked ? '1px solid #666' : '1px solid #000',
                                                    opacity: isBooked ? 0.6 : 1
                                                }}
                                            >
                                                {seat}
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )
                })}
                <div className='theater-screen'></div>
                <p>All eyes this way please!</p>
            </div>

            <hr />

            {/* Pay button */}
            <div
                className={`pay-btn ${selectedSeats.length < seatLimit ? 'disabled' : ''}`}
                onClick={() => {
                    if (selectedSeats.length < seatLimit) {
                        showToast(`Please select all ${seatLimit} seats before proceeding!`, "warning")
                        return
                    }
                    navigate('/bookingDetails', { state: bookingData })
                }}
            >
                Pay ₹{totalPrice}
            </div>
        </div>
    )
}

export default ScreenPage
