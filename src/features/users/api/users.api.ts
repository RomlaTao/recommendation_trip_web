import { apiClient } from '@/core/api/axios'
import { unwrapApiData } from '@/core/api/envelope'
import type {
  AdminCreateUserDto,
  AdminForcePasswordDto,
  AdminUpdateUserDto,
  AdminUsersListData,
  AdminUsersQuery,
  ChangePasswordDto,
  PublicUserCard,
  UpdateProfileDto,
  UserProfile,
} from '@/features/users/types/users.types'

function normalizeUserProfile(raw: unknown): UserProfile {
  const u = (raw ?? {}) as Record<string, unknown>
  return {
    id: String(u.id ?? ''),
    username: String(u.username ?? u.email ?? 'user'),
    email: String(u.email ?? ''),
    role: 'user',
    phone: null,
    city: typeof u.location === 'string' ? u.location : null,
    country: null,
    bio: typeof u.bio === 'string' ? u.bio : null,
    avatarUrl: typeof u.avatarUrl === 'string' ? u.avatarUrl : null,
    isActive: u.isActive !== false,
    tagPreferences: {},
    createdAt: String(u.createdAt ?? ''),
    updatedAt: String(u.updatedAt ?? ''),
  }
}

export const usersApi = {
  getMyProfile: async (): Promise<UserProfile> =>
    normalizeUserProfile(unwrapApiData(await apiClient.get('/account/me').then((r) => r.data))),

  updateProfile: async (dto: UpdateProfileDto): Promise<UserProfile> =>
    normalizeUserProfile(
      unwrapApiData(await apiClient.patch('/account/me', dto).then((r) => r.data)),
    ),

  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    await apiClient.post('/account/password', dto)
  },

  getPublicUserById: async (id: string): Promise<PublicUserCard> =>
    unwrapApiData(await apiClient.get(`/users/public/${id}`).then((r) => r.data)),

  getPublicUserByUsername: async (username: string): Promise<PublicUserCard> =>
    unwrapApiData(
      await apiClient.get(`/users/public/by-username/${username}`).then((r) => r.data),
    ),

  adminListUsers: async (query: AdminUsersQuery): Promise<AdminUsersListData> => {
    const res = await apiClient.get('/users', {
      params: {
        page: query.page ?? 1,
        limit: query.pageSize ?? 10,
      },
    })
    const raw = unwrapApiData<{
      items?: unknown[]
      total?: number
      page?: number
      limit?: number
    }>(res.data)
    const items = Array.isArray(raw.items) ? raw.items : []
    return {
      list: items.map(normalizeUserProfile),
      total: Number(raw.total ?? items.length),
      page: Number(raw.page ?? query.page ?? 1),
      pageSize: Number(raw.limit ?? query.pageSize ?? 10),
    }
  },

  adminGetUserById: async (id: string): Promise<UserProfile> =>
    normalizeUserProfile(
      unwrapApiData(await apiClient.get(`/users/${id}`).then((r) => r.data)),
    ),

  adminGetUserByUsername: async (username: string): Promise<UserProfile> =>
    normalizeUserProfile(
      unwrapApiData(
        await apiClient.get(`/users/by-username/${username}`).then((r) => r.data),
      ),
    ),

  adminCreateUser: async (dto: AdminCreateUserDto): Promise<UserProfile> =>
    normalizeUserProfile(
      unwrapApiData(await apiClient.post('/users', dto).then((r) => r.data)),
    ),

  adminUpdateUser: async (id: string, dto: AdminUpdateUserDto): Promise<UserProfile> =>
    normalizeUserProfile(
      unwrapApiData(await apiClient.patch(`/users/${id}`, dto).then((r) => r.data)),
    ),

  adminForcePassword: async (id: string, dto: AdminForcePasswordDto): Promise<void> => {
    await apiClient.post(`/users/${id}/password`, dto)
  },

  adminDeleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
