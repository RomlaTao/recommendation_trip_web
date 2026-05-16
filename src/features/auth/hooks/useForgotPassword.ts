import { useMutation } from '@tanstack/react-query'

import { forgotPassword } from '@/features/auth/client'
import type { ForgotPasswordDto } from '@/features/auth/types/auth.types'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => forgotPassword({ email: dto.email }),
  })
}
