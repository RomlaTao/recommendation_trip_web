import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'

export default function IndexRoute() {
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  return isAuthenticated
    ? <Navigate to="/trips" replace />
    : <Navigate to="/login" replace />
}
