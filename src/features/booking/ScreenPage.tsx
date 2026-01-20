import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import FilmStrip from '../../components/FilmStrip'
import './screenPage.css'
import type { LayoutBlock, PriceType } from '../../types'
import { useToast } from '../../context/ToastContext.tsx'
import SeatGrid from './SeatGrid'
import axiosClient from '../../api/axiosClient'

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
    const theaterNameState = location.state?.theaterName
    const theaterLocationState = location.state?.theaterLocation

    const [layout, setLayout] = useState<LayoutBlock[]>([])
    const [prices, setPrices] = useState<PriceType[]>([])
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
    const [show, setShow] = useState<ShowType | null>(null)
    const [bookedSeatsSet, setBookedSeatsSet] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const { showToast } = useToast()

    const isDragging = useRef(false)
    const dragMode = useRef<'select' | 'deselect' | null>(null)

    // Stop dragging globally
    useEffect(() => {
        const handleGlobalPointerUp = () => {
            isDragging.current = false
            dragMode.current = null
        }
        window.addEventListener('pointerup', handleGlobalPointerUp)
        return () => window.removeEventListener('pointerup', handleGlobalPointerUp)
    }, [])

    useEffect(() => {
        if (!showId) return

        const fetchShowTime = async () => {
            try {
                const res = await axiosClient.get(`/show-times/${showId}`)
                const showData = res.data?.data
                if (!showData) return

                setShow(showData)
                setPrices(showData.price)

                const rawLayout = showData.screen.layout
                const parsedLayout = typeof rawLayout === 'string'
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

            } catch (err: any) {
                console.error('Fetch failed', err)
                // Don't show toast or redirect for 401 errors - handled globally
                if (err.response?.status !== 401) {
                    showToast("Show not found", "error")
                    setError(true)
                    setTimeout(() => navigate('/404'), 1000)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchShowTime()
    }, [showId, showToast])


    const getLayoutTypeForSeat = useCallback((seat: string): string => {
        const row = seat[0]
        const section = layout.find(sec => sec.layout.rows.includes(row))
        return section?.type || ''
    }, [layout])

    const toggleSeat = useCallback((seat: string, forceMode?: 'select' | 'deselect') => {
        if (bookedSeatsSet.has(seat)) return

        setSelectedSeats(prev => {
            const exists = prev.some(s => s.seat === seat)
            const shouldSelect = forceMode ? forceMode === 'select' : !exists

            if (shouldSelect) {
                if (exists) return prev
                if (prev.length >= seatLimit) return prev

                const sectionType = getLayoutTypeForSeat(seat)
                if (!sectionType) return prev

                const validPriceCategory = prices.find(p => p.layoutType === sectionType)
                const layoutType = validPriceCategory ? validPriceCategory.layoutType : (prices[0]?.layoutType || sectionType)

                return [...prev, { seat, layoutType }]
            } else {
                if (!exists) return prev
                return prev.filter(s => s.seat !== seat)
            }
        })
    }, [bookedSeatsSet, getLayoutTypeForSeat, prices, seatLimit])

    const selectedSeatsRef = useRef(selectedSeats)
    useEffect(() => { selectedSeatsRef.current = selectedSeats }, [selectedSeats])

    const stableHandleSeatAction = useCallback((seat: string, type: 'down' | 'enter', e?: React.PointerEvent) => {
        if (type === 'down' && e) {
            e.preventDefault()
            // access ref
            const isSelected = selectedSeatsRef.current.some(s => s.seat === seat)
            dragMode.current = isSelected ? 'deselect' : 'select'
            isDragging.current = true
            toggleSeat(seat, dragMode.current)
        } else if (type === 'enter') {
            if (isDragging.current && dragMode.current) {
                toggleSeat(seat, dragMode.current)
            }
        }
    }, [toggleSeat])

    const getPriceForTypeCalc = (layoutType: string) => {
        const priceObj = prices.find(p => p.layoutType === layoutType)
        return priceObj?.price || prices[0]?.price || 0
    }

    const totalPrice = selectedSeats.reduce((sum, s) => sum + getPriceForTypeCalc(s.layoutType), 0)
    const seatsLeft = seatLimit - selectedSeats.length

    if (loading) return (
        <div className="loading-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FilmStrip animated={true} style={{ width: '250px' }}>
                <h6>Loading...</h6>
            </FilmStrip>
        </div>
    )

    if (error || !layout.length || !show) return null

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

            {/* Render the memoized grid */}
            <SeatGrid
                layout={layout}
                prices={prices}
                selectedSeats={selectedSeats}
                bookedSeatsSet={bookedSeatsSet}
                onSeatAction={stableHandleSeatAction}
            />

            <hr />

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
