import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'

export function usePublicUserByUsername(username: string) {
  return useQuery({
    queryKey: ['users', 'public', 'username', username],
    queryFn: () => usersApi.getPublicUserByUsername(username),
    enabled: !!username,
  })
}

export function usePublicUserById(id: string) {
  return useQuery({
    queryKey: ['users', 'public', 'id', id],
    queryFn: () => usersApi.getPublicUserById(id),
    enabled: !!id,
  })
}
