import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Theater from '../components/Theater.tsx'
import './home.css'
import type { CardType } from '../types.ts'
import type { TheaterType } from '../types.ts'
import { useToast } from '../context/ToastContext.tsx'

const Home = () => {

    const location = useLocation()
    const token = localStorage.getItem("accessToken")
    // Initialize active tab from navigation state if available, default to 'movie'
    const [active, setActive] = useState(location.state?.activeTab || 'movie')
    const [movies, setMovies] = useState<CardType[]>([])
    const [theaters, setTheaters] = useState<TheaterType[]>([])

    const { showToast } = useToast()

    useEffect(() => {
        if (!token) return

        const fetchMovies = async () => {
            try {
                const res = await fetch(
                    "http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/movies",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }

                const data: CardType[] = await res.json()

                setMovies(data)
            } catch (err) {
                console.error("Failed to fetch movies:", err)
                showToast("Failed to load movies. Please try again later.", "error")
                setMovies([])
            }
        }


        fetchMovies()
    }, [token, showToast])


    useEffect(() => {
        if (!token) return

        const fetchTheaters = async () => {
            try {
                const res = await fetch(
                    "http://ec2-13-201-98-117.ap-south-1.compute.amazonaws.com:3000/theaters",
                    {
                        headers: {
                            accept: "*/*",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!res.ok) {
                    throw new Error(`Theaters fetch failed: ${res.status}`)
                }

                const data = await res.json()

                if (!Array.isArray(data.data)) {
                    throw new Error("Theaters data is not an array")
                }

                setTheaters(data.data)
            } catch (err) {
                console.error(err)
                showToast("Failed to load theaters. Please try again later.", "error")
                setTheaters([])
            }
        }

        fetchTheaters()
    }, [token, showToast])


    const [searchQuery, setSearchQuery] = useState('')

    // Filtered lists based on search query
    const filteredMovies = movies.filter(movie =>
        movie.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredTheaters = theaters.filter(theater =>
        theater.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <Navbar page="home" />

            <div className='container'>
                <h1>Now Showing</h1>
                <div className='controls-wrapper'>
                    <div className='categoryBtn'>
                        <button
                            className={active === 'movie' ? 'active' : ''}
                            onClick={() => setActive('movie')}
                        >
                            Movie
                        </button>

                        <button
                            className={active === 'theater' ? 'active' : ''}
                            onClick={() => setActive('theater')}
                        >
                            Theater
                        </button>
                    </div>

                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder={`Search ${active}s...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Movie List */}
            <div className={`cardsList ${active !== 'movie' ? 'hidden' : ''}`}>
                {filteredMovies.length > 0 ? (
                    filteredMovies.map(movie => (
                        <Card key={movie.id} movie={movie} />
                    ))
                ) : (
                    <div className="no-results">No movies found matching {searchQuery}</div>
                )}
            </div>

            {/* Theater List */}
            <div className={`theaterList ${active !== 'theater' ? 'hidden' : ''}`}>
                {filteredTheaters.length > 0 ? (
                    filteredTheaters.map(theater => (
                        <Theater key={theater.id} theater={theater} />
                    ))
                ) : (
                    <div className="no-results">No theaters found matching {searchQuery}</div>
                )}
            </div>
        </>
    )

}

export default Home
