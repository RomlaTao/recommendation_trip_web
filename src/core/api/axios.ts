import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

import { AUTH_STORAGE_KEY, REFRESH_STORAGE_KEY } from '@/core/constants/session'

const defaultBaseUrl = 'http://localhost:3000'

export type ApiError = {
  statusCode: number
  message: string
}

type ApiErrorPayload = {
  message?: string | string[]
}

/** Matches API refresh payload; kept in core to avoid importing feature contracts. */
export type RefreshedSessionTokens = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

type RefreshResponse = {
  tokens: RefreshedSessionTokens
}

let applyRefreshedSession: ((tokens: RefreshedSessionTokens) => void) | null = null

/** Wire Zustand (or tests) so silent refresh updates the same session source as login. */
export function registerAuthSessionBridge(handler: (tokens: RefreshedSessionTokens) => void): void {
  applyRefreshedSession = handler
}

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string | null> | null = null

function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, accessToken)
  localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken)
}

function clearSessionAndRedirect() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(REFRESH_STORAGE_KEY)
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

function resolveErrorMessage(message: string | string[] | undefined, fallback: string): string {
  if (!message) {
    return fallback
  }

  if (Array.isArray(message)) {
    return message[0] ?? fallback
  }

  return message
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY)
  if (!refreshToken || refreshToken.length < 32) {
    return null
  }

  const response = await axios.post<RefreshResponse>(
    `${import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl}/auth/refresh`,
    { refreshToken },
    {
      timeout: 15_000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
    },
  )

  const tokens = response.data.tokens
  if (applyRefreshedSession) {
    applyRefreshedSession(tokens)
  } else {
    persistTokens(tokens.accessToken, tokens.refreshToken)
  }
  return tokens.accessToken
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        const accessToken = await refreshPromise
        if (!accessToken) {
          clearSessionAndRedirect()
          return Promise.reject({
            statusCode: 401,
            message: 'Session expired. Please login again.',
          } satisfies ApiError)
        }

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch {
        clearSessionAndRedirect()
        return Promise.reject({
          statusCode: 401,
          message: 'Session expired. Please login again.',
        } satisfies ApiError)
      }
    }

    const normalizedError: ApiError = {
      statusCode: error.response?.status ?? 500,
      message: resolveErrorMessage(error.response?.data?.message, error.message ?? 'Unexpected error'),
    }

    return Promise.reject(normalizedError)
  },
)
