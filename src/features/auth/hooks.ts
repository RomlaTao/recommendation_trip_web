import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  forgotPassword,
  getProfile,
  login,
  logout,
  refreshSession,
  register,
} from '@/features/auth/client'
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RefreshTokenPayload,
  RegisterPayload,
} from '@/features/auth/contracts'
import { authQueryKeys } from '@/features/auth/query-keys'
import { AUTH_STORAGE_KEY } from '@/core/constants/session'
import { mapProfileToUserInfo, parseRoleFromAccessToken } from '@/features/auth/profile-map'
import { useAuthStore } from '@/features/auth/store'

export { authQueryKeys }

export function useProfileQuery() {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: getProfile,
    enabled: Boolean(accessToken),
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await login(payload)
      setSession(response.tokens)
      const profile = await getProfile()
      const role = parseRoleFromAccessToken(response.tokens.accessToken)
      setUser(mapProfileToUserInfo(profile, role))
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() })
      return response
    },
  })
}

export function useRefreshSessionMutation() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: async (payload: RefreshTokenPayload) => {
      const response = await refreshSession(payload)
      setSession(response.tokens)
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() })
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
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)
  const setStatus = useAuthStore((s) => s.setStatus)
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    hydrateFromStorage()

    const bootstrap = async () => {
      const { accessToken, refreshToken } = useAuthStore.getState()
      if (!accessToken && !refreshToken) {
        return
      }

      setStatus('loading')
      try {
        const profile = await queryClient.fetchQuery({
          queryKey: authQueryKeys.profile(),
          queryFn: getProfile,
        })
        const role = parseRoleFromAccessToken(accessToken ?? localStorage.getItem(AUTH_STORAGE_KEY) ?? '')
        setUser(mapProfileToUserInfo(profile, role))
        setStatus('authenticated')
      } catch {
        if (!refreshToken) {
          clearSession()
          queryClient.removeQueries({ queryKey: authQueryKeys.all })
          return
        }

        try {
          const refreshed = await refreshSession({ refreshToken })
          setSession(refreshed.tokens)
          const profile = await queryClient.fetchQuery({
            queryKey: authQueryKeys.profile(),
            queryFn: getProfile,
          })
          const role = parseRoleFromAccessToken(refreshed.tokens.accessToken)
          setUser(mapProfileToUserInfo(profile, role))
          setStatus('authenticated')
        } catch {
          clearSession()
          queryClient.removeQueries({ queryKey: authQueryKeys.all })
        }
      }
    }

    void bootstrap()
  }, [clearSession, hydrateFromStorage, queryClient, setSession, setStatus, setUser])
}
