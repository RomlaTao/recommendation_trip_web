import { useMutation } from '@tanstack/react-query'

import { resendVerification } from '@/features/auth/client'
import type { ResendVerificationDto } from '@/features/auth/types/auth.types'

export function useResendVerification() {
  return useMutation({
    mutationFn: (dto: ResendVerificationDto) => resendVerification({ email: dto.email }),
  })
}
