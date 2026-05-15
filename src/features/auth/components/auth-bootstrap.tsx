import type { PropsWithChildren } from 'react'

import { useBootstrapSession } from '@/features/auth/hooks'

export function AuthBootstrap({ children }: PropsWithChildren) {
  useBootstrapSession()
  return <>{children}</>
}
