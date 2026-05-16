import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { registerAuthSessionBridge } from '@/core/api/axios'
import { queryClient } from '@/app/providers/query-client'
import { router } from '@/app/router'
import { AuthBootstrap } from '@/features/auth/components/auth-bootstrap'
import { useAuthStore } from '@/features/auth/store'

registerAuthSessionBridge((tokens) => {
  useAuthStore.getState().setSession(tokens)
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
