// ─── Request DTOs (match backend2 auth.controller.ts) ─────────────────────────

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
}

export interface RefreshDto {
  refreshToken: string
}

export interface LogoutDto {
  refreshToken: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

export interface VerifyEmailDto {
  token: string
}

export interface ResendVerificationDto {
  email: string
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface UserInfo {
  id: string
  username: string
  email: string
  role: 'user' | 'admin' | 'partner'
  isEmailVerified: boolean
  createdAt: string
  avatarUrl?: string
}

export interface LoginResponse {
  user: UserInfo
  accessToken: string
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

// ─── Backend wrapper (ResponseCommon) ─────────────────────────────────────────

export interface ApiResponse<T> {
  statusCode: number
  success: boolean
  message: string
  data: T
}
