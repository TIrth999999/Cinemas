import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilmStrip from '../components/FilmStrip'
import { useToast } from '../context/ToastContext.tsx'
import './theaterDetails.css'

type ShowTime = {
    id: string
    startTime: string
    movieId: string
}

type MovieSlot = {
    movieId: string
    movieName: string
    languages: string[]
    categories: string[]
    times: {
        showId: string
        time: string
    }[]
}

const TheaterDetails = () => {
    const navigate = useNavigate()
    const { theaterId } = useParams<{ theaterId: string }>()
    const location = useLocation()

    const token = localStorage.getItem('accessToken')

    const [schedule, setSchedule] = useState<Record<string, MovieSlot[]>>({})
    const [activeDate, setActiveDate] = useState<string>('')
    const [theaterDetails, setTheaterDetails] = useState({
        name: location.state?.theaterName || 'Theater',
        location: location.state?.theaterLocation || ''
    })
    const [selectedShow, setSelectedShow] = useState<{
        showId: string
        movieId: string
    } | null>(null)
    const [showSeatModal, setShowSeatModal] = useState(false)
    const [seatCount, setSeatCount] = useState(1)
    const [loading, setLoading] = useState(true)

    const { showToast } = useToast()

    useEffect(() => {
        if (!token || !theaterId) return

        const loadSchedule = async () => {
            try {
                // 0. Fetch theater details if missing
                if (theaterDetails.name === 'Theater') {
                    const theaterRes = await fetch(
                        `http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/theaters/${theaterId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    const theaterData = await theaterRes.json()
                    if (theaterData?.data) {
                        setTheaterDetails({
                            name: theaterData.data.name,
                            location: theaterData.data.location
                        })
                    }
                }

                // 1. Fetch movies in theater
                const moviesRes = await fetch(
                    `http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/theaters/${theaterId}/movies`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                const moviesData = await moviesRes.json()

                const movieMap = new Map<string, any>()
                moviesData.data.movies.forEach((m: any) => movieMap.set(m.id, m))

                // 2. Fetch screens
                const screensRes = await fetch(
                    `http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/theaters/${theaterId}/screens`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                const screens = await screensRes.json()

                const grouped: Record<string, MovieSlot[]> = {}

                // 3. Fetch showtimes screen-wise in PARALLEL
                const screenPromises = screens.map((screen: any) =>
                    fetch(
                        `http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/screens/${screen.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ).then(r => r.json())
                )

                const screensData = await Promise.all(screenPromises)

                for (const screenData of screensData) {
                    const showTimes: ShowTime[] =
                        screenData?.data?.screen?.showTimes || []

                    for (const show of showTimes) {
                        const movie = movieMap.get(show.movieId)
                        if (!movie) continue

                        const date = show.startTime.split('T')[0]
                        const time = new Date(show.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })

                        if (!grouped[date]) grouped[date] = []

                        let movieEntry = grouped[date].find(
                            m => m.movieId === movie.id
                        )

                        if (!movieEntry) {
                            movieEntry = {
                                movieId: movie.id,
                                movieName: movie.name,
                                languages: movie.languages,
                                categories: movie.category || [],
                                times: [],
                            }
                            grouped[date].push(movieEntry)
                        }

                        movieEntry.times.push({
                            showId: show.id,
                            time,
                        })
                    }
                }

                const dates = Object.keys(grouped).sort()
                setSchedule(grouped)

                // Only set activeDate if not already set or invalid
                if (dates.length > 0) {
                    setActiveDate(prev => prev && dates.includes(prev) ? prev : dates[0])
                }
            } catch (err) {
                console.error('Failed to load theater schedule', err)
                showToast("Failed to load theater schedule due to a network error", "error")
            } finally {
                setLoading(false)
            }
        }

        loadSchedule()
    }, [token, theaterId, theaterDetails.name])

    const allDates = Object.keys(schedule).sort()
    const [dateIndex, setDateIndex] = useState(0)
    const visibleDates = allDates.slice(dateIndex, dateIndex + 3)

    const goNext = () => {
        if (dateIndex + 3 < allDates.length) {
            setDateIndex(prev => prev + 1)
        }
    }

    const goPrev = () => {
        if (dateIndex > 0) {
            setDateIndex(prev => prev - 1)
        }
    }

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FilmStrip animated={true} style={{ width: '250px' }}>
                    <h6>Loading...</h6>
                </FilmStrip>
            </div>
        )
    }

    const getCategoryStyle = (category: string) => {
        // Generate a persistent color based on string hash
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Use HSL for vibrant, distinct colors (Hue: 0-360, Sat: 70%, Light: 45%)
        const h = Math.abs(hash) % 360;
        return {
            '--cat-color': `hsl(${h}, 70%, 45%)`,
            '--cat-bg': `hsla(${h}, 70%, 45%, 0.1)`
        } as React.CSSProperties;
    }

    return (
        <>
            <Navbar page="home" />

            <div className="theater-container">
                {/* Header */}
                <div className="theater-header">
                    <i
                        className="fas fa-arrow-left back-icon"
                        onClick={() => navigate('/home', { state: { activeTab: 'theater' } })}
                    ></i>

                    <div>
                        <h1>{theaterDetails.name}</h1>
                        <p>
                            <i className="fas fa-location-dot" style={{ marginRight: '8px' }}></i>
                            {theaterDetails.location}
                        </p>
                    </div>
                </div>

                {/* Date Slider */}
                <div className="date-slider">
                    <button
                        className="arrow"
                        onClick={goPrev}
                        disabled={dateIndex === 0}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>

                    {visibleDates.map(date => (
                        <button
                            key={date}
                            className={`date-btn ${activeDate === date ? 'active' : ''}`}
                            onClick={() => setActiveDate(date)}
                        >
                            <span className="month">
                                {new Date(date).toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                            <span className="date">
                                {new Date(date).getDate()}
                            </span>
                            <span className="day">
                                {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                            </span>
                        </button>
                    ))}

                    <button
                        className="arrow"
                        onClick={goNext}
                        disabled={dateIndex + 3 >= allDates.length}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>



                <hr />

                {/* Movies List */}
                {schedule[activeDate]?.map(movie => (
                    <div key={movie.movieId} className="movie-row">
                        <div className="movie-info">
                            <h3>{movie.movieName}</h3>
                            <div className="tags-container">
                                {movie.languages.map((lang, i) => (
                                    <span key={`lang-${i}`} className="tag language">{lang}</span>
                                ))}
                                {movie.categories.map((cat, i) => (
                                    <span
                                        key={`cat-${i}`}
                                        className="tag category"
                                        style={getCategoryStyle(cat)}
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>

                            <div className="time-slots">
                                {movie.times.map(t => (
                                    <button
                                        key={t.showId}
                                        className={
                                            selectedShow?.showId === t.showId ? 'time active' : 'time'
                                        }
                                        onClick={() =>
                                            setSelectedShow({
                                                showId: t.showId,
                                                movieId: movie.movieId,
                                            })
                                        }
                                    >
                                        {t.time}
                                    </button>

                                ))}
                            </div>
                        </div>

                        <button
                            className="book-now"
                            disabled={
                                !selectedShow || selectedShow.movieId !== movie.movieId
                            }
                            onClick={() => {
                                if (!selectedShow) return
                                setShowSeatModal(true)
                            }}

                        >
                            Book Now
                        </button>

                    </div>
                ))}

                {showSeatModal && selectedShow && (
                    <div className="seat-modal-overlay">
                        <div className="seat-modal">
                            <h3>Select Seats</h3>

                            <div className="seat-options">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <button
                                        key={n}
                                        className={seatCount === n ? 'active' : ''}
                                        onClick={() => setSeatCount(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="cancel"
                                    onClick={() => setShowSeatModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="proceed"
                                    onClick={() =>
                                        navigate(`/selectSeat/${selectedShow.showId}`, {
                                            state: {
                                                seats: seatCount,
                                                from: location.pathname,
                                                theaterName: theaterDetails.name,
                                                theaterLocation: theaterDetails.location
                                            },
                                        })
                                    }
                                >
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    )
}

export default TheaterDetails
