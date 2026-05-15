import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/features/users/api/users.api'
import { profileQueryKey } from './useMyProfile'
import type { UpdateProfileDto } from '@/features/users/types/users.types'

export function useUpdateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => usersApi.updateProfile(dto),
    onSuccess: (updated) => {
      qc.setQueryData(profileQueryKey, updated)
    },
  })
}
