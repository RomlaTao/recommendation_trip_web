export type TokenPair = {
  accessToken: string
  refreshToken: string
  expiresIn?: number
}

export interface LoginPayload {
  email: string
  password: string
}

/** Nest `POST /auth/login` body — unwrap → `{ userId, tokens }`. */
export interface LoginResponse {
  userId: string
  tokens: TokenPair
}

export interface RefreshTokenPayload {
  refreshToken: string
}

export interface RefreshTokenResponse {
  tokens: TokenPair
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface UserProfileResponse {
  id: string
  email: string
  username?: string | null
  avatarUrl?: string | null
  isActive?: boolean
  createdAt?: string | Date
}

export type AuthSessionState = {
  accessToken: string | null
  refreshToken: string | null
  status: 'anonymous' | 'loading' | 'authenticated'
}
