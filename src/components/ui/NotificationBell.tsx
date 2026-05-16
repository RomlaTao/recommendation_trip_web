import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks/useNotifications'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const notificationsQuery = useNotifications({ page: 1, limit: 10 })
  const markRead = useMarkNotificationRead()

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const items = notificationsQuery.data?.items ?? []
  const unreadCount = useMemo(
    () => items.reduce((acc, item) => acc + (item.isRead ? 0 : 1), 0),
    [items],
  )

  function resolveDestination(data?: Record<string, unknown> | null): string | null {
    if (data && typeof data.type === 'string') {
      if (data.type === 'place_approved' || data.type === 'place_rejected') {
        return '/my-places'
      }
    }
    if (!data) return null
    const placeId = typeof data.placeId === 'string' ? data.placeId : null
    if (placeId) return `/places/${placeId}`
    return null
  }

  return (
    <div className={className} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-colors relative"
        aria-label="Open notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 min-w-[16px] h-4 rounded-full bg-success text-on-primary text-[9px] leading-4 px-1 text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] bg-surface-container-lowest border border-outline-variant shadow-xl z-50">
          <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant">
              Notifications
            </p>
            {notificationsQuery.isFetching && (
              <span className="text-[10px] text-secondary">Syncing...</span>
            )}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-sm text-on-surface-variant italic">
                No notifications yet.
              </p>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (!item.isRead) {
                    markRead.mutate(item.id)
                  }
                  const destination = resolveDestination({
                    ...(item.data ?? {}),
                    type: item.type,
                  })
                  if (destination) {
                    navigate(destination)
                    setOpen(false)
                  }
                }}
                className={`w-full text-left px-4 py-3 border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors ${
                  item.isRead ? 'bg-surface-container-lowest' : 'bg-success/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-on-surface line-clamp-1">{item.title}</p>
                  {!item.isRead && <span className="w-2 h-2 rounded-full bg-success mt-1.5" />}
                </div>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{item.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
