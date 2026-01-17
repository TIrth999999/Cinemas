import './card.css'
import type { CardType } from '../types'
import { useNavigate } from 'react-router-dom'

type Props = {
  movie: CardType
}

const BookCard = ({ movie }: Props) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/movie/${movie.id}`)
  }

  return (
    <div className='card' onClick={handleClick} style={{ cursor: 'pointer' }}>
      <img src={movie.image} />
      <h4>{movie.name}</h4>
    </div>
  )
}

export default BookCard