import { type JSX } from "react"
import { useAuth } from "./auth/AuthContext"
import Pre404 from "./pages/Pre404"

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Pre404 />
  }

  return children
}

export default ProtectedRoute

