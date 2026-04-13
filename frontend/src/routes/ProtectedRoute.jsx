import { Navigate } from "react-router-dom"
import useAuthStore from "../store/authStore"

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore()

  // 🔒 BELUM LOGIN
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 🔒 ROLE CHECK
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}