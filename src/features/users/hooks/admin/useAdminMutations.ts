import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'
import type {
  AdminCreateUserDto,
  AdminForcePasswordDto,
  AdminUpdateUserDto,
} from '@/features/users/types/users.types'

// Invalidate the full admin users list after any write
const invalidateAdminList = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: ['admin', 'users'] })

export function useAdminCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: AdminCreateUserDto) => usersApi.adminCreateUser(dto),
    onSuccess: () => invalidateAdminList(qc),
  })
}

export function useAdminUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdminUpdateUserDto }) =>
      usersApi.adminUpdateUser(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', id] })
      invalidateAdminList(qc)
    },
  })
}

export function useAdminDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.adminDeleteUser(id),
    onSuccess: () => invalidateAdminList(qc),
  })
}

export function useAdminForcePassword() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdminForcePasswordDto }) =>
      usersApi.adminForcePassword(id, dto),
  })
}
