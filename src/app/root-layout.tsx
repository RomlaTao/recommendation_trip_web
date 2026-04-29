import { Outlet } from 'react-router-dom'

import { AppLayout } from '@/core/components/app-layout'
import { SessionActions } from '@/features/auth/components/session-actions'

export function RootLayout() {
  return (
    <AppLayout>
      <SessionActions />
      <Outlet />
    </AppLayout>
  )
}
