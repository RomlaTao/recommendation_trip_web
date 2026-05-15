import type { UserInfo } from '@/features/auth/types/auth.types'
import type { UserProfileResponse } from '@/features/auth/contracts'

export function parseRoleFromAccessToken(accessToken: string): UserInfo['role'] {
  try {
    const payload = accessToken.split('.')[1]
    if (!payload) return 'user'
    const json = JSON.parse(atob(payload)) as { roleCodes?: string[]; roleCode?: string }
    const codes = [...(json.roleCodes ?? []), ...(json.roleCode ? [json.roleCode] : [])]
    const upper = codes.map((c) => String(c).toUpperCase())
    if (upper.some((c) => c === 'ADMIN')) return 'admin'
    if (upper.some((c) => c.includes('PARTNER'))) return 'partner'
    return 'user'
  } catch {
    return 'user'
  }
}

export function mapProfileToUserInfo(
  profile: UserProfileResponse | Record<string, unknown>,
  role: UserInfo['role'],
): UserInfo {
  const p = profile as Record<string, unknown>
  const id = String(p.id ?? '')
  const email = String(p.email ?? '')
  const username =
    p.username != null && String(p.username).length > 0
      ? String(p.username)
      : (email.split('@')[0] ?? 'user')
  const createdAt =
    p.createdAt != null
      ? new Date(p.createdAt as string | number | Date).toISOString()
      : new Date().toISOString()

  return {
    id,
    username,
    email,
    role,
    isEmailVerified: Boolean(p.isActive ?? true),
    createdAt,
    avatarUrl: p.avatarUrl != null ? String(p.avatarUrl) : undefined,
  }
}
