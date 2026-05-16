import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { resetPassword } from '@/features/auth/client'
import type { ResetPasswordDto } from '@/features/auth/types/auth.types'

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (dto: ResetPasswordDto) =>
      resetPassword({ token: dto.token, newPassword: dto.newPassword }),
    onSuccess: () => {
      navigate('/login?reset=success')
    },
  })
}
