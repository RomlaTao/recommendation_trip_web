import { useEffect, type PropsWithChildren } from 'react'

import { useBootstrapSession, useProfileQuery } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'

export function AuthBootstrap({ children }: PropsWithChildren) {
  const setProfile = useAuthStore((state) => state.setProfile)
  useBootstrapSession()

  const profileQuery = useProfileQuery()
  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data)
    }
  }, [profileQuery.data, setProfile])

  return <>{children}</>
}
