import './App.css'
import { Route, Routes } from 'react-router-dom'

// Auth
import Login from './features/auth/Login'
import Signup from './features/auth/Signup'

// Protected Features
import Home from './features/home/Home'
import MyTicket from './pages/MyTicket'
import MovieDetail from './features/movies/MovieDetail'
import ScreenPage from './features/booking/ScreenPage'
import BookingDetails from './features/booking/BookingDetails'
import TheaterDetails from './features/theaters/TheaterDetails'
import PaymentSuccess from './features/booking/PaymentSuccess'
import PaymentFailure from './features/booking/PaymentFailure'
import TicketPage from './features/booking/Ticket'
import Ticket from './features/booking/Ticket'

// Layout/Protection
import ProtectedRoute from './ProtectedRoute'
import Pre404 from './pages/Pre404'
import NotFound404 from './pages/NotFound404'
import { useAuth } from './auth/AuthContext'

function App() {
  const { isAuthenticated } = useAuth()

  const CatchAllRoute = () => {
    return isAuthenticated ? <NotFound404 /> : <Pre404 />
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/tickets" element={<MyTicket />} />

          <Route path="/movie/:movieId" element={<MovieDetail />} />
          <Route path="/theater/:theaterId" element={<TheaterDetails />} />

          <Route path="/selectSeat/:showId" element={<ScreenPage />} />
          <Route path="/bookingDetails/" element={<BookingDetails />} />

          <Route path="/success*" element={<PaymentSuccess />} />
          <Route path="/cancel/*" element={<PaymentFailure />} />

          {/* Check if TicketPage and Ticket are same */}
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/ticket/:orderId" element={<Ticket showHomeButton={true} />} />
        </Route>

        <Route path="*" element={<CatchAllRoute />} />
      </Routes>
    </>
  )
}

export default App