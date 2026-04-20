import { Navigate } from 'react-router-dom'
import { authApi } from '../services/api.js'

export default function AdminRoute({ children }) {
  const user = authApi.getUser()
  if (!authApi.isAuthenticated()) return <Navigate to="/login?next=/admin" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}
