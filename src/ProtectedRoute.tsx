import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

