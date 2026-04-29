import { apiClient } from '@/core/api/axios'
import type {
  LoginResponse,
  LoginPayload,
  RefreshTokenResponse,
  RefreshTokenPayload,
  UserProfileResponse,
} from '@/features/auth/contracts'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export async function refreshSession(
  payload: RefreshTokenPayload,
): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', payload)
  return response.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getProfile(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileResponse>('/account/me')
  return response.data
}
