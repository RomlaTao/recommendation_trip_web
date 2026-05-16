import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { register } from '@/features/auth/client'
import type { RegisterDto } from '@/features/auth/types/auth.types'

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (dto: RegisterDto) =>
      register({ email: dto.email, username: dto.username, password: dto.password }),
    onSuccess: (_data, variables) => {
      navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`)
    },
  })
}
