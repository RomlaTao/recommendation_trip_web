import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import type { QueryClient } from '@tanstack/react-query'

import { getApiBaseUrl } from '@/core/api/base-url'
import { unwrapApiData } from '@/core/api/envelope'
import { AUTH_STORAGE_KEY, REFRESH_STORAGE_KEY } from '@/core/constants/session'
import { authQueryKeys } from '@/features/auth/query-keys'
import type { RefreshTokenResponse } from '@/features/auth/contracts'
import { useAuthStore } from '@/features/auth/store'

export type ApiError = {
  statusCode: number
  message: string
}

type ApiErrorPayload = {
  message?: string | string[]
}

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let apiQueryClient: QueryClient | null = null

export function attachApiQueryClient(client: QueryClient): void {
  apiQueryClient = client
}

let refreshPromise: Promise<string | null> | null = null

function clearSessionAndRedirect() {
  useAuthStore.getState().clearSession()
  apiQueryClient?.removeQueries({ queryKey: authQueryKeys.all })
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

  const base = getApiBaseUrl().replace(/\/$/, '')
  const refreshUrl = `${base}/auth/refresh`

  const response = await axios.post<unknown>(
    refreshUrl,
    { refreshToken },
    {
      timeout: 15_000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
    },
  )

  const body = unwrapApiData<RefreshTokenResponse>(response.data)
  useAuthStore.getState().setSession(body.tokens)
  void apiQueryClient?.invalidateQueries({ queryKey: authQueryKeys.profile() })
  return body.tokens.accessToken
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

    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED'
      const base = getApiBaseUrl()
      const devHint = import.meta.env.DEV
        ? ` Start Nest on the same host/port as ${base}. If the site is opened via http://127.0.0.1 or a LAN IP, ensure Nest CORS allows that Origin (dev allows all).`
        : ''
      return Promise.reject({
        statusCode: 0,
        message: isTimeout
          ? 'Request timed out. Try again.'
          : `Cannot reach the API.${devHint}`,
      } satisfies ApiError)
    }

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
