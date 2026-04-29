import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getProfile, login, logout, refreshSession } from '@/features/auth/client'
import type { LoginPayload, RefreshTokenPayload } from '@/features/auth/contracts'
import { useAuthStore } from '@/features/auth/store'

export const authQueryKeys = {
  all: ['auth'] as const,
  profile: () => [...authQueryKeys.all, 'profile'] as const,
}

export function useProfileQuery() {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: getProfile,
    enabled: Boolean(accessToken),
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await login(payload)
      setSession(response.tokens)
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() })
      return response
    },
  })
}

export function useRefreshSessionMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: async (payload: RefreshTokenPayload) => {
      const response = await refreshSession(payload)
      setSession(response.tokens)
      return response
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: async () => {
      try {
        await logout()
      } finally {
        clearSession()
        queryClient.removeQueries({ queryKey: authQueryKeys.all })
      }
    },
  })
}

export function useBootstrapSession() {
  const queryClient = useQueryClient()
  const {
    accessToken,
    refreshToken,
    hydrateFromStorage,
    setSession,
    clearSession,
    setStatus,
  } = useAuthStore((state) => state)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  useEffect(() => {
    const bootstrap = async () => {
      if (!accessToken && !refreshToken) {
        setStatus('anonymous')
        return
      }

      setStatus('loading')
      try {
        await queryClient.fetchQuery({
          queryKey: authQueryKeys.profile(),
          queryFn: getProfile,
        })
        setStatus('authenticated')
      } catch {
        if (!refreshToken) {
          clearSession()
          return
        }

        try {
          const refreshed = await refreshSession({ refreshToken })
          setSession(refreshed.tokens)
          await queryClient.fetchQuery({
            queryKey: authQueryKeys.profile(),
            queryFn: getProfile,
          })
          setStatus('authenticated')
        } catch {
          clearSession()
        }
      }
    }

    void bootstrap()
  }, [accessToken, clearSession, queryClient, refreshToken, setSession, setStatus])
}
