export interface NotificationItem {
  id: string
  sourceEventId: string
  recipientUserId: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown> | null
  isRead: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedNotifications {
  items: NotificationItem[]
  total: number
  page: number
  limit: number
}

export interface NotificationPreference {
  type: string
  emailEnabled: boolean
  inAppEnabled: boolean
}
