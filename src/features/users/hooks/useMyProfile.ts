import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'

export const profileQueryKey = ['account', 'profile'] as const

export function useMyProfile() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: usersApi.getMyProfile,
  })
}
