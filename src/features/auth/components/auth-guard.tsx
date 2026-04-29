import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { LoadingShell } from '@/core/components/loading-shell'
import { useAuthStore } from '@/features/auth/store'

export function AuthGuard({ children }: PropsWithChildren) {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)

  if (status === 'loading') {
    return <LoadingShell title="Checking your session" />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
