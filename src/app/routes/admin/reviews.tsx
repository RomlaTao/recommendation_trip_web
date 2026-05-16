import { useMemo, useState } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import {
  useAdminReviews,
  useRestoreReviewByAdmin,
  useSoftDeleteReviewByAdmin,
} from '@/features/admin/hooks/useAdminReviews'
import type { AdminReview } from '@/features/admin/types/admin.types'

const statuses = ['all', 'active', 'deleted'] as const

export default function AdminReviewsRoute() {
  const [status, setStatus] = useState<(typeof statuses)[number]>('all')
  const [keyword, setKeyword] = useState('')
  const [rating, setRating] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [pendingDelete, setPendingDelete] = useState<AdminReview | null>(null)

  const reviews = useAdminReviews({
    page,
    limit: pageSize,
    q: keyword.trim() || undefined,
    rating: rating ? Number(rating) : undefined,
    status,
  })
  const softDelete = useSoftDeleteReviewByAdmin()
  const restore = useRestoreReviewByAdmin()

  const total = reviews.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rows = reviews.data?.items ?? []

  const startItem = useMemo(() => (total === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, total])
  const endItem = useMemo(() => Math.min(page * pageSize, total), [page, pageSize, total])

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
            alt="Review moderation hero"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-scrim/80 via-scrim/20 to-transparent flex flex-col justify-end p-8">
            <h2 className="font-display-lg text-on-media mb-2">Review Management</h2>
            <p className="text-on-media/80 max-w-xl font-body-base">
              Moderate reviews with search, rating filters, and soft-delete controls for content quality.
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

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative min-w-[280px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-12 pr-4 py-2.5 font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search by place, author, or review..."
              />
            </div>
            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value)
                setPage(1)
              }}
              className="bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 font-body-md text-on-surface min-w-[150px] focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>

        {reviews.isError && <Alert variant="error" message="Failed to load reviews. Please try again." />}

        <div className="border border-outline-variant overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-surface-container-low">
                <tr>
                  {['ID', 'Place', 'Author', 'Rating', 'Status', 'Description', 'Action'].map((h) => (
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
                {reviews.isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant">
                      Loading reviews...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-outline-variant align-top">
                      <td className="px-5 py-4 font-body-md text-on-surface">{r.id.slice(0, 8)}</td>
                      <td className="px-5 py-4 font-body-md text-on-surface">{r.placeName}</td>
                      <td className="px-5 py-4 font-body-md text-on-surface">@{r.authorName}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded bg-accent-highlight/25 text-primary border border-outline-variant px-2 py-1 text-xs font-semibold">
                          <span className="material-symbols-outlined text-[16px]">star</span>
                          {r.rating}/5
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-sm">
                          <p className={r.status === 'deleted' ? 'text-error font-semibold' : 'text-success font-semibold'}>
                            {r.status.toUpperCase()}
                          </p>
                          <p className="text-xs text-secondary">Created: {formatDate(r.createdAt)}</p>
                          <p className="text-xs text-secondary">Updated: {formatDate(r.updatedAt)}</p>
                          {r.deletedAt && <p className="text-xs text-secondary">Deleted: {formatDate(r.deletedAt)}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-body-md text-on-surface max-w-[360px]">
                        <p className="line-clamp-3">{r.comment || '-'}</p>
                      </td>
                      <td className="px-5 py-4">
                        {r.status === 'deleted' ? (
                          <Button
                            variant="ghost"
                            className="py-1.5 px-3 text-xs text-success"
                            onClick={() => restore.mutate(r.id)}
                            disabled={restore.isPending}
                          >
                            RESTORE
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="py-1.5 px-3 text-xs text-error"
                            onClick={() => setPendingDelete(r)}
                            disabled={softDelete.isPending || restore.isPending}
                          >
                            SOFT DELETE
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Showing {startItem}-{endItem} of {total} reviews
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

      <ConfirmationDialog
        open={!!pendingDelete}
        title="Soft Delete Review"
        message={
          pendingDelete
            ? `Are you sure you want to soft-delete this review by @${pendingDelete.authorName}?`
            : ''
        }
        confirmText="DELETE"
        isDanger
        isLoading={softDelete.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          softDelete.mutate(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(null)
              setStatus('deleted')
              setPage(1)
            },
          })
        }}
      />
    </AdminLayout>
  )
}
