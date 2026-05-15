import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'

/** Wraps routes that require authentication. Redirects to /login if unauthenticated. */
export function AuthGuard() {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="min-h-[40vh] grid place-content-center font-body-md text-on-surface-variant">
        Checking your session…
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
