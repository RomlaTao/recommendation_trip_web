import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { notificationsApi } from '@/features/notifications/api/notifications.api'

const statuses = ['all', 'unread', 'read'] as const

export default function AdminActivityLogsRoute() {
  const [status, setStatus] = useState<(typeof statuses)[number]>('all')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const logsQuery = useQuery({
    queryKey: ['admin', 'activity-logs', status, page, pageSize],
    queryFn: () =>
      notificationsApi.list({
        page,
        limit: pageSize,
        isRead: status === 'all' ? undefined : status === 'read',
      }),
    placeholderData: (previous) => previous,
  })

  const rows = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    const base = logsQuery.data?.items ?? []
    if (!q) return base
    return base.filter((item) =>
      [item.title, item.body, item.type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [logsQuery.data?.items, keyword])

  const total = logsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  function formatDate(value?: string | null): string {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('vi-VN')
  }

  return (
    <AdminLayout>
      <div className="p-container-padding max-w-7xl mx-auto space-y-8">
        <div className="relative h-[220px] rounded-xl overflow-hidden">
          <img
            alt="Activity logs hero"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-scrim/80 via-scrim/20 to-transparent flex flex-col justify-end p-8">
            <h2 className="font-display-lg text-on-media mb-2">Activity Logs</h2>
            <p className="text-on-media/80 max-w-xl font-body-base">
              Track recent system events and moderation actions from notification activity streams.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-outline-variant pb-1">
          <div className="flex gap-8">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(s)
                  setPage(1)
                }}
                className={`pb-4 px-1 border-b-2 font-title-sm transition-colors ${
                  status === s
                    ? 'border-success text-success'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-12 pr-4 py-2.5 font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search title, body, or type..."
            />
          </div>
        </div>

        {logsQuery.isError && <Alert variant="error" message="Failed to load activity logs." />}

        <div className="border border-outline-variant overflow-hidden bg-surface-container-lowest">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="bg-surface-container-low">
                <tr>
                  {['Timestamp', 'Actor', 'Action', 'Target', 'Type', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left font-label-caps text-label-caps text-on-surface-variant uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logsQuery.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                      Loading activity logs...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  rows.map((log) => (
                    <tr key={log.id} className="border-t border-outline-variant align-top">
                      <td className="px-5 py-4 font-body-md text-on-surface">{formatDate(log.createdAt)}</td>
                      <td className="px-5 py-4 font-body-md text-on-surface">@system</td>
                      <td className="px-5 py-4 font-body-md text-on-surface">{log.title}</td>
                      <td className="px-5 py-4 font-body-md text-on-surface max-w-[360px]">
                        <p className="line-clamp-2">{log.body}</p>
                      </td>
                      <td className="px-5 py-4 font-body-md text-on-surface-variant">{log.type}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.isRead ? 'bg-success/15 text-success' : 'bg-accent-highlight/35 text-primary'
                          }`}
                        >
                          {log.isRead ? 'read' : 'unread'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Showing {startItem}-{endItem} of {total} logs
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                PREV
              </Button>
              <span className="text-sm text-on-surface-variant px-3">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                NEXT
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
