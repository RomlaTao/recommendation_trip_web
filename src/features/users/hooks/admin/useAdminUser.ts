import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => usersApi.adminGetUserById(id),
    enabled: !!id,
  })
}
