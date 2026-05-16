import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'
import type { AdminUsersQuery } from '@/features/users/types/users.types'

export const adminUsersQueryKey = (query: AdminUsersQuery) =>
  ['admin', 'users', query] as const

export function useAdminUsers(query: AdminUsersQuery = {}) {
  return useQuery({
    queryKey: adminUsersQueryKey(query),
    queryFn: () => usersApi.adminListUsers(query),
  })
}
