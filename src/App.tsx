
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import MyTicket from './pages/MyTicket'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MovieDetail from './components/MovieDetail'
import ScreenPage from './components/ScreenPage'
import BookingDetails from './pages/BookingDetails'
import TheaterDetails from './components/TheaterDetails'
import PaymentSuccess from './components/PaymentSuccess'
import TicketPage from './components/Ticket'
import PaymentFailure from './components/PaymentFailure'
import Ticket from './components/Ticket'

import Pre404 from './pages/Pre404'
import NotFound404 from './pages/NotFound404'
import { useAuth } from './auth/AuthContext'

function App() {


  const { isAuthenticated } = useAuth()



  // Component to render for catch-all route based on authentication
  const CatchAllRoute = () => {
    return isAuthenticated ? <NotFound404 /> : <Pre404 />
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/tickets" element={
          <ProtectedRoute>
            <MyTicket />
          </ProtectedRoute>
        } />

        <Route path="/movie/:movieId" element={
          <ProtectedRoute>
            <MovieDetail />
          </ProtectedRoute>
        } />

        <Route path="/selectSeat/:showId" element={
          <ProtectedRoute>
            <ScreenPage />
          </ProtectedRoute>
        } />

        <Route path="/bookingDetails/" element={
          <ProtectedRoute>
            <BookingDetails />
          </ProtectedRoute>
        } />

        <Route path="/theater/:theaterId" element={
          <ProtectedRoute>
            <TheaterDetails />
          </ProtectedRoute>
        } />

        <Route path="/success*" element={<PaymentSuccess />} />

        <Route path="/ticket" element={
          <ProtectedRoute>
            <TicketPage />
          </ProtectedRoute>
        } />

        <Route path="/cancel/*" element={<PaymentFailure />} />

        <Route path="/ticket/:orderId" element={
          <ProtectedRoute>
            <Ticket showHomeButton={true} />
          </ProtectedRoute>
        } />

        {/* Catch-all route - must be last */}
        <Route path="*" element={<CatchAllRoute />} />
      </Routes>
    </>
  )
}

export default App