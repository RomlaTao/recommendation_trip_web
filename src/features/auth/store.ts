import { create } from 'zustand'

import { AUTH_STORAGE_KEY, REFRESH_STORAGE_KEY } from '@/core/constants/session'
import type { AuthSessionState, TokenPair } from '@/features/auth/contracts'
import type { UserInfo } from '@/features/auth/types/auth.types'

type AuthStore = AuthSessionState & {
  user: UserInfo | null
  setSession: (tokens: TokenPair) => void
  clearSession: () => void
  hydrateFromStorage: () => void
  setStatus: (status: AuthSessionState['status']) => void
  setUser: (user: UserInfo | null) => void
}

const initialState: AuthSessionState & { user: UserInfo | null } = {
  accessToken: null,
  refreshToken: null,
  status: 'anonymous',
  user: null,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setSession: (tokens) => {
    localStorage.setItem(AUTH_STORAGE_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refreshToken)

    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      status: 'authenticated',
    })
  },
  clearSession: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(REFRESH_STORAGE_KEY)
    set({ ...initialState })
  },
  hydrateFromStorage: () => {
    const accessToken = localStorage.getItem(AUTH_STORAGE_KEY)
    const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY)

    if (!accessToken || !refreshToken) {
      set({ ...initialState })
      return
    }

    set({
      accessToken,
      refreshToken,
      status: 'loading',
      user: null,
    })
  },
  setStatus: (status) => {
    set({ status })
  },
  setUser: (user) => {
    set({ user })
  },
}))
