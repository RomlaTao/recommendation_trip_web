import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/features/notifications/api/notifications.api'

export function useNotifications(params?: { page?: number; limit?: number; isRead?: boolean }) {
  return useQuery({
    queryKey: ['notifications', params?.page ?? 1, params?.limit ?? 10, params?.isRead],
    queryFn: () => notificationsApi.list(params),
    refetchInterval: 30000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
