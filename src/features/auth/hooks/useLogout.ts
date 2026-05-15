import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { logout } from '@/features/auth/client'
import { authQueryKeys } from '@/features/auth/query-keys'
import { useAuthStore } from '@/features/auth/store'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.clearSession)

  return useMutation({
    mutationFn: async () => {
      try {
        await logout()
      } finally {
        clearSession()
        queryClient.removeQueries({ queryKey: authQueryKeys.all })
      }
    },
    onSettled: () => {
      navigate('/login', { replace: true })
    },
  })
}
