import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar';
import './movieDetails.css'
import type { MovieType } from '../../types';

import { useToast } from '../../context/ToastContext.tsx'

const MovieDetail = () => {
  const navigate = useNavigate()
  const { movieId } = useParams<{ movieId: string }>()

  const token = localStorage.getItem("accessToken")
  const [movie, setMovie] = useState<MovieType>()
  const { showToast } = useToast()
  type TimeSlot = {
    time: string
    showId: string
  }

  const [dateTimeMap, setDateTimeMap] = useState<Record<string, TimeSlot[]>>({})

  const [selectedDate, setSelectedDate] = useState<string | null>("*Select Date First")
  const [selectedTheater, setSelectedTheater] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>("*Select Time Slot")
  const [selectedTheaterName, setSelectedTheaterName] = useState<string | null>("*Select Theater First")
  const [showModal, setShowModal] = useState(false)
  const [noOfSeat, setnoOfSeat] = useState(1);
  const [showId, setShowId] = useState("")

  const [isMovieLoading, setIsMovieLoading] = useState(true);
  const [isTimesLoading, setIsTimesLoading] = useState(false);

  const datesContainerRef = useRef<HTMLDivElement>(null);

  const scrollDates = (direction: 'left' | 'right') => {
    if (datesContainerRef.current) {
      const scrollAmount = 200;
      datesContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!token) return

    const fetchMovies = async () => {
      setIsMovieLoading(true);
      try {
        const res = await fetch(
          `/api/movies/${movieId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data: MovieType = await res.json()
        setMovie(data)

        if (data.theaters && data.theaters.length > 0) {
          const firstTheater = data.theaters[0];
          setSelectedTheater(firstTheater.id);
          setSelectedTheaterName(firstTheater.name);
          findDateTime(data.id, firstTheater.id);
        }

      } catch (err) {
        console.error("Failed to fetch movies:", err)
        showToast("Failed to load movie details. Redirecting...", "error")
        navigate('/home') // Redirect to home or 404
      } finally {
        setIsMovieLoading(false);
      }
    }


    fetchMovies()
  }, [token, movieId])

  async function findDateTime(mId: string, tId: string) {
    if (!token) return

    setIsTimesLoading(true);
    setDateTimeMap({});
    setSelectedDate(null);
    setSelectedTheater(tId);

    if (datesContainerRef.current) {
      datesContainerRef.current.scrollLeft = 0;
    }

    const newDateTimeMap: Record<string, TimeSlot[]> = {}


    try {
      const res = await fetch(
        `/api/theaters/${tId}/screens`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const screens = await res.json()

      const screenRequests = screens.map((screen: any) =>
        fetch(
          `/api/screens/${screen.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(r => r.ok ? r.json() : null)
      )

      const screensData = await Promise.all(screenRequests)

      for (const screenData of screensData) {
        if (!screenData) continue

        const showTimes = screenData?.data?.screen?.showTimes || []

        for (const show of showTimes) {
          if (show.movieId !== mId) continue

          const dateObj = new Date(show.startTime)

          // Filter past dates (keep today and future)
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const showDateZeroTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())

          if (showDateZeroTime < today) continue

          const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`

          const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

          if (!newDateTimeMap[dateKey]) {
            newDateTimeMap[dateKey] = []
          }

          const alreadyExists = newDateTimeMap[dateKey].some(
            t => t.showId === show.id
          )


          if (!alreadyExists) {
            newDateTimeMap[dateKey].push({
              time,
              showId: show.id
            })
          }

        }
      }

      // Update data BEFORE stopping loading
      setDateTimeMap(newDateTimeMap)

      // Auto-select first sorted date
      const sortedDates = Object.keys(newDateTimeMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      if (sortedDates.length > 0) {
        setSelectedDate(sortedDates[0]);
      } else {
        setSelectedDate(null)
      }

    } catch (err) {
      console.error("Failed to fetch date/time:", err)
      showToast("Failed to fetch showtimes", "error")
    } finally {
      setIsTimesLoading(false);
    }
  }

  const openModal = () => {
    if (
      movie &&
      selectedTheaterName && selectedTheaterName !== "*Select Theater First" &&
      selectedDate && selectedDate !== "*Select Date First" &&
      selectedTime && selectedTime !== "*Select Time Slot"
    ) {
      setShowModal(true)
    } else {
      showToast("Please select theater, date, and time first!", "warning")
    }
  }

  const closeModal = () => setShowModal(false)

  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    return () => document.body.classList.remove('modal-open')
  }, [showModal])


  return (
    <>
      <Navbar page="home" />
      <div className="containerr">
        <div className='movieLeft'>
          <div className='backBtn' onClick={() => navigate('/home')}>
            <i className='fas fa-arrow-left'></i> Back
          </div>
          <div>
            <h1>Date</h1>
            <div className='dates-container-wrapper'>
              {Object.keys(dateTimeMap).length > 0 && (
                <button className="date-scroll-btn left" onClick={() => scrollDates('left')}>
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}

              <div className="dates" ref={datesContainerRef} style={Object.keys(dateTimeMap).length === 0 && !isTimesLoading ? { justifyContent: 'center' } : {}}>
                {isTimesLoading ? (
                  // Skeleton for Dates - Render only if loading
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="date-card skeleton"></div>
                  ))
                ) : Object.keys(dateTimeMap).length === 0 ? (
                  <div className="no-results" style={{ color: '#000000ff', padding: '10px' }}>No shows available</div>
                ) : (
                  Object.keys(dateTimeMap)
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Sort ascending
                    .map(date => {
                      // Manual parse to ensure local time
                      const [y, m, d] = date.split('-').map(Number)
                      const dateObj = new Date(y, m - 1, d)

                      const day = dateObj.getDate()
                      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

                      return (
                        <div
                          key={date}
                          className={`date-card ${selectedDate === date ? 'activee' : ''}`}
                          onClick={() => setSelectedDate(date)}
                        >
                          <span className="date-month">{month}</span>
                          <span className="date-day">{day}</span>
                          <span className="date-weekday">{weekday}</span>
                        </div>
                      )
                    })
                )}
              </div>

              {Object.keys(dateTimeMap).length > 0 && (
                <button className="date-scroll-btn right" onClick={() => scrollDates('right')}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              )}
            </div>
          </div>
          <div>
            <h1>Theater</h1>
            <div className='theaters'>
              {isMovieLoading ? (
                // Skeleton for Theaters - Only if movie/theaters loading
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="theater-tag skeleton" style={{ width: 150 + Math.random() * 100 + 'px', height: '45px' }}></div>
                ))
              ) : (
                movie?.theaters.map(theater => (
                  <p
                    key={theater.id}
                    className={selectedTheater === theater.id ? 'activee' : ''}
                    onClick={() => {
                      setSelectedTheater(theater.id);
                      setSelectedTheaterName(theater.name);
                      findDateTime(movie.id, theater.id)
                    }}

                  >
                    <i className="fas fa-map-marker-alt" style={{ fontSize: '14px' }}></i>
                    {theater.name}
                  </p>
                ))
              )}

            </div>
          </div>

          <div>
            <h1>Time</h1>
            <div className=''>
              <div className="times">
                {selectedDate && dateTimeMap[selectedDate]?.map(slot => (
                  <span
                    key={slot.showId}
                    className={selectedTime === slot.time ? 'activee' : ''}
                    onClick={() => {
                      setSelectedTime(slot.time)
                      setShowId(slot.showId)
                    }}
                  >
                    {slot.time}
                  </span>

                ))}

              </div>

            </div>
          </div>
        </div>
        <div className='movieRight'>
          <img src={movie?.image} width={'100%'} height={'400px'}></img>
          <div>
            <h1>{movie?.name}</h1>
            <p>{movie?.description}</p>
            <div className='otherDetail'>
              <b>Duration </b> <p>{movie?.duration} m</p>
            </div>
            <div className='otherDetail2'>
              <b>Language </b> <p>{movie?.languages.map(lang => (
                lang + " "
              ))}</p>
            </div>
            <div className='otherDetail2'>
              <b>Category </b> <p>{movie?.category.map(lang => (
                lang + " "
              ))}</p>
            </div>
          </div>
          <div className='bookCard'>
            <h1>{selectedTheaterName}</h1>
            <h3>{selectedDate}</h3>
            <p>{selectedTime}</p>
            <br>
            </br>
            <p>*Seat Selection can be done after this</p>
            <button onClick={openModal}>Book Now</button>
          </div>
        </div>
      </div>


      {showModal && (
        <div className="seat-modal-overlay">
          <div className="seat-modal">
            <h3>Select Seats</h3>

            <div className="seat-options">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  className={noOfSeat === n ? 'active' : ''}
                  onClick={() => setnoOfSeat(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="cancel"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="proceed"
                onClick={() =>
                  navigate(`/selectSeat/${showId}`, {
                    state: { seats: noOfSeat },
                  })
                }
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default MovieDetail