import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { getProfile, login } from '@/features/auth/client'
import { authQueryKeys } from '@/features/auth/query-keys'
import { mapProfileToUserInfo, parseRoleFromAccessToken } from '@/features/auth/profile-map'
import { useAuthStore } from '@/features/auth/store'
import type { LoginDto } from '@/features/auth/types/auth.types'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const data = await login({ email: dto.email, password: dto.password })
      setSession(data.tokens)
      const profile = await getProfile()
      const role = parseRoleFromAccessToken(data.tokens.accessToken)
      const user = mapProfileToUserInfo(profile, role)
      setUser(user)
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() })
      return { user, accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken }
    },
    onSuccess: (data) => {
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
        return
      }
      navigate('/')
    },
  })
}
