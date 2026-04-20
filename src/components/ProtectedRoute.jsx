import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const isAuth = !!localStorage.getItem('auth_token')

  if (!isAuth) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.email_verified_at) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}
