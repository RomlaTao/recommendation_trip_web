import { create } from 'zustand'

import { AUTH_STORAGE_KEY, REFRESH_STORAGE_KEY } from '@/core/constants/session'
import type { AuthSessionState, TokenPair, UserProfileResponse } from '@/features/auth/contracts'

type AuthStore = AuthSessionState & {
  setSession: (tokens: TokenPair) => void
  clearSession: () => void
  setProfile: (profile: UserProfileResponse | null) => void
  hydrateFromStorage: () => void
  setStatus: (status: AuthSessionState['status']) => void
}

const initialState: AuthSessionState = {
  accessToken: null,
  refreshToken: null,
  profile: null,
  status: 'anonymous',
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
  setProfile: (profile) => {
    set({ profile })
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
    })
  },
  setStatus: (status) => {
    set({ status })
  },
}))
