export type LoginPayload = {
  email: string
  password: string
}

export type RefreshTokenPayload = {
  refreshToken: string
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type LoginResponse = {
  userId: string
  tokens: TokenPair
}

export type RefreshTokenResponse = {
  tokens: TokenPair
}

export type UserProfileResponse = {
  id: string
  email: string
  username: string | null
  avatarUrl: string | null
  isActive: boolean
}

export type AuthStatus = 'anonymous' | 'loading' | 'authenticated'

export type AuthSessionState = {
  accessToken: string | null
  refreshToken: string | null
  profile: UserProfileResponse | null
  status: AuthStatus
}

export type AuthErrorResponse = {
  statusCode: number
  message: string
}
