import { useMutation } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'
import type { ChangePasswordDto } from '@/features/users/types/users.types'

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => usersApi.changePassword(dto),
  })
}
