import './theater.css'
import type { TheaterType } from '../types'
import { useNavigate } from 'react-router-dom'
import { getCinemaGraphic } from './CinemaGraphics'

type Props = {
  theater: TheaterType
}

const Theater = ({ theater }: Props) => {
  const navigate = useNavigate();
  const theaterData = {
    theaterId: theater.id,
    theaterName: theater.name,
    theaterLocation: theater.location,
  }

  const Graphic = getCinemaGraphic(theater.id);

  return (
    <div className='theater' onClick={() => navigate(`/theater/${theater.id}`, { state: theaterData })}>
      <div className="theater-content">
        <h2 style={{ color: '#1e9de1' }}>{theater.name}</h2>
        <p><i className='fas fa-location-dot'></i> {theater.location}</p>
      </div>

      <div className="theater-graphic">
        <Graphic className="cinema-svg" />
      </div>

      <i className='fas fa-arrow-right theater-arrow'></i>
    </div>

  )
}

export default Theater