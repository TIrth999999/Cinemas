import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import MyTicket from './pages/MyTicket'
import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MovieDetail from './components/MovieDetail'
import ScreenPage from './components/ScreenPage'
import BookingDetails from './pages/BookingDetails'
import TheaterDetails from './components/TheaterDetails'
import PaymentSuccess from './components/PaymentSuccess'
import PaymentCancel from './components/PaymentFailure'
import TicketPage from './components/Ticket'
import PaymentFailure from './components/PaymentFailure'
import Ticket from './components/Ticket'
import CameraLoader from './components/CameraLoader'

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Skip splash if already logged in (token exists)
    return !localStorage.getItem('accessToken')
  })
  const location = useLocation()

  // Simulate initial app load check (optional: use session storage to show only once per session)
  useEffect(() => {
    // If we are not showing splash (because logged in), do nothing
    if (!showSplash) return

    // Only show splash on effective first load or root refresh
    // For now, simple standard splash
    const timer = setTimeout(() => {
      // If we wanted to rely purely on the CameraLoader onComplete, we could.
      // But a safety timeout is good practice.
    }, 4000)
    return () => clearTimeout(timer)
  }, [showSplash])

  const handleIntroComplete = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return <CameraLoader intro={true} onComplete={handleIntroComplete} />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <Login />
        } />
        <Route path="/signup" element={
          <Signup />
        } />
        <Route path="*" element={<>Sorry Page Not Found</>} />
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


      </Routes>
    </>
  )
}

export default App