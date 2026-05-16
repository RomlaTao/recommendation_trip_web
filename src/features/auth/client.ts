import { apiClient } from '@/core/api/axios'
import { unwrapApiData } from '@/core/api/envelope'
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  RegisterPayload,
  UserProfileResponse,
} from '@/features/auth/contracts'

export async function register(payload: RegisterPayload): Promise<void> {
  const response = await apiClient.post<unknown>('/auth/register', {
    email: payload.email,
    username: payload.username,
    password: payload.password,
    passwordConfirmation: payload.password,
  })
  unwrapApiData<null>(response.data)
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  const response = await apiClient.post<unknown>('/auth/forgot-password', payload)
  unwrapApiData<null>(response.data)
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<unknown>('/auth/login', payload)
  return unwrapApiData<LoginResponse>(response.data)
}

export async function refreshSession(
  payload: RefreshTokenPayload,
): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<unknown>('/auth/refresh', payload)
  return unwrapApiData<RefreshTokenResponse>(response.data)
}

export async function logout(): Promise<void> {
  await apiClient.post<unknown>('/auth/logout')
}

export async function getProfile(): Promise<UserProfileResponse> {
  const response = await apiClient.get<unknown>('/account/me')
  return unwrapApiData<UserProfileResponse>(response.data)
}

export async function resetPassword(dto: { token: string; newPassword: string }): Promise<void> {
  const response = await apiClient.post<unknown>('/auth/reset-password', dto)
  unwrapApiData<null>(response.data)
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.get('/auth/verify-email', { params: { token } })
}

export async function resendVerification(dto: { email: string }): Promise<void> {
  const response = await apiClient.post<unknown>('/auth/resend-verification', dto)
  unwrapApiData<null>(response.data)
}
