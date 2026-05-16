import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { verifyEmail } from '@/features/auth/client'
import type { VerifyEmailDto } from '@/features/auth/types/auth.types'

export function useVerifyEmail() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (dto: VerifyEmailDto) => verifyEmail(dto.token),
    onSuccess: () => {
      navigate('/login?verified=true')
    },
  })
}
