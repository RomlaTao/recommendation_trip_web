// ─── Profile shapes (match users.service.ts PublicUserProfile / PublicUserCard) ──

export interface UserProfile {
  id: string
  username: string
  email: string
  role: 'user' | 'admin' | 'partner'
  phone: string | null
  city: string | null
  country: string | null
  bio: string | null
  avatarUrl: string | null
  isActive: boolean
  tagPreferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface PublicUserCard {
  id: string
  username: string
  city: string | null
  country: string | null
  bio: string | null
  avatarUrl: string | null
}

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface UpdateProfileDto {
  phone?: string
  city?: string
  country?: string
  bio?: string
  avatarUrl?: string
  tagPreferences?: Record<string, unknown>
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

// ─── Admin DTOs ────────────────────────────────────────────────────────────────

export interface AdminCreateUserDto {
  username: string
  email: string
  password: string
  role?: 'user' | 'admin' | 'partner'
}

export interface AdminUpdateUserDto {
  username?: string
  email?: string
  role?: 'user' | 'admin' | 'partner'
  phone?: string
  city?: string
  country?: string
  bio?: string
  avatarUrl?: string
  isActive?: boolean
  tagPreferences?: Record<string, unknown>
}

export interface AdminForcePasswordDto {
  password: string
}

export interface AdminUsersQuery {
  page?: number
  pageSize?: number
  keyword?: string
  role?: 'user' | 'admin' | 'partner'
  isActive?: boolean
}

export interface AdminUsersListData {
  list: UserProfile[]
  total: number
  page: number
  pageSize: number
}
