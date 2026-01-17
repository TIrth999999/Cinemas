import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"
import { useEffect, type JSX } from "react"
import { useToast } from './context/ToastContext'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      showToast("Please login to access this page", "warning")
    }
  }, [isAuthenticated, showToast])

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
