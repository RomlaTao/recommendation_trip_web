import { apiClient } from '@/core/api/axios'
import { unwrapApiData } from '@/core/api/envelope'
import type {
  NotificationPreference,
  PaginatedNotifications,
} from '@/features/notifications/types/notifications.types'

export const notificationsApi = {
  list: async (params?: {
    page?: number
    limit?: number
    isRead?: boolean
  }): Promise<PaginatedNotifications> => {
    const res = await apiClient.get('/notifications', { params })
    const payload = unwrapApiData<PaginatedNotifications>(res.data)
    return {
      items: payload.items ?? [],
      total: Number(payload.total ?? 0),
      page: Number(payload.page ?? params?.page ?? 1),
      limit: Number(payload.limit ?? params?.limit ?? 20),
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  listPreferences: async (): Promise<NotificationPreference[]> => {
    const res = await apiClient.get('/notifications/preferences')
    return unwrapApiData<NotificationPreference[]>(res.data)
  },

  updatePreference: async (
    type: string,
    dto: { emailEnabled?: boolean; inAppEnabled?: boolean },
  ): Promise<NotificationPreference> => {
    const res = await apiClient.put(`/notifications/preferences/${type}`, dto)
    return unwrapApiData<NotificationPreference>(res.data)
  },
}
