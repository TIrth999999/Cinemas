import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Card from '../../components/common/Card'
import Theater from '../../features/theaters/Theater'
import FilmStrip from '../../components/FilmStrip'
import './home.css'
import { useMovies } from '../../hooks/useMovies'
import { useTheaters } from '../../hooks/useTheaters'

const Home = () => {
    const location = useLocation()

    const [active, setActive] = useState(location.state?.activeTab || 'movie')
    const [searchQuery, setSearchQuery] = useState('')

    const { movies, loading: loadingMovies } = useMovies()
    const { theaters, loading: loadingTheaters } = useTheaters()

    const filteredMovies = movies.filter(movie =>
        movie.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredTheaters = theaters.filter(theater =>
        theater.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loadingMovies || loadingTheaters) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FilmStrip animated={true} style={{ width: '200px' }}>
                    <h6>Loading...</h6>
                </FilmStrip>
            </div>
        )
    }

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
