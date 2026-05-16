import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useAdminPlaces,
  useApprovePlace,
  useDeletePlaceByAdmin,
  useRejectPlace,
  useRestorePlaceByAdmin,
  useUpdatePlaceByAdmin,
} from '@/features/admin/hooks/useAdminPlaces'
import { placesApi } from '@/features/places/api/places.api'
import type { AdminPlace } from '@/features/admin/types/admin.types'
import { DynamicFormFields } from '@/components/forms/DynamicFormFields'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'

const statuses = ['all', 'pending', 'published', 'rejected', 'deleted'] as const
const editPlaceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  address: z.string().min(3, 'Address is required'),
  category: z.string().min(1, 'Category is required'),
  thumbnailUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})
type EditPlaceValues = z.infer<typeof editPlaceSchema>

export default function AdminPlacesRoute() {
  const [status, setStatus] = useState<(typeof statuses)[number]>('all')
  const [keyword, setKeyword] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [detailPlace, setDetailPlace] = useState<AdminPlace | null>(null)
  const [editingPlace, setEditingPlace] = useState<AdminPlace | null>(null)
  const [rejectingPlace, setRejectingPlace] = useState<AdminPlace | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [confirmAction, setConfirmAction] = useState<
    | { type: 'approve'; place: AdminPlace }
    | { type: 'delete'; place: AdminPlace }
    | { type: 'save-edit'; place: AdminPlace; values: EditPlaceValues }
    | { type: 'cancel-edit' }
    | null
  >(null)
  const places = useAdminPlaces(status === 'all' ? undefined : status)
  const approve = useApprovePlace()
  const reject = useRejectPlace()
  const updatePlace = useUpdatePlaceByAdmin()
  const deletePlace = useDeletePlaceByAdmin()
  const restorePlace = useRestorePlaceByAdmin()
  const categoriesQuery = useQuery({
    queryKey: ['places', 'categories'],
    queryFn: placesApi.categories,
  })
  const searchQuery = useQuery({
    queryKey: ['admin', 'places', 'search', keyword, selectedCategoryId],
    queryFn: () =>
      placesApi.search({
        q: keyword.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
        page: 1,
        limit: 50,
      }),
    enabled: Boolean(keyword.trim() || selectedCategoryId),
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditPlaceValues>({
    resolver: zodResolver(editPlaceSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      category: '',
      thumbnailUrl: '',
      imageUrl: '',
    },
  })

  const isPendingTab = status === 'pending'
  const isAllTab = status === 'all'
  const isPublishedTab = status === 'published'
  const isRejectedTab = status === 'rejected'
  const isDeletedTab = status === 'deleted'

  function formatDate(value?: string | null): string {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('vi-VN')
  }

  function resolveCategoryLabel(rawCategory?: string, rawCategoryName?: string): string {
    const categories = categoriesQuery.data ?? []
    const byId =
      rawCategory ? categories.find((c) => c.id === rawCategory)?.name : undefined
    if (byId) return byId
    const byName = rawCategoryName
      ? categories.find((c) => c.name.toLowerCase() === rawCategoryName.toLowerCase())?.name
      : undefined
    if (byName) return byName
    if (rawCategoryName && !rawCategoryName.match(/^[0-9a-f-]{36}$/i)) return rawCategoryName
    return '-'
  }

  useEffect(() => {
    if (!editingPlace) return
    reset({
      name: editingPlace.name ?? '',
      description: (editingPlace.description ?? '') as string,
      address: editingPlace.address ?? '',
      category: editingPlace.category ?? '',
      thumbnailUrl: editingPlace.thumbnailUrl ?? '',
      imageUrl: editingPlace.imageUrl ?? '',
    })
  }, [editingPlace, reset])

  function executeConfirmAction() {
    if (!confirmAction) return
    if (confirmAction.type === 'approve') {
      approve.mutate(confirmAction.place.id)
      setConfirmAction(null)
      return
    }
    if (confirmAction.type === 'delete') {
      deletePlace.mutate({ id: confirmAction.place.id, reason: 'Deleted by admin from place management' })
      setConfirmAction(null)
      return
    }
    if (confirmAction.type === 'save-edit') {
      const values = confirmAction.values
      updatePlace.mutate(
        {
          id: confirmAction.place.id,
          dto: {
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            address: values.address.trim(),
            category: values.category,
            thumbnailUrl: values.thumbnailUrl?.trim() || undefined,
            imageUrl: values.imageUrl?.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            setEditingPlace(null)
            setConfirmAction(null)
          },
        },
      )
      return
    }
    if (confirmAction.type === 'cancel-edit') {
      setEditingPlace(null)
      setConfirmAction(null)
    }
  }

  const tablePlaces = useMemo(() => {
    const adminItems = places.data ?? []
    if (!keyword.trim() && !selectedCategoryId) return adminItems
    const q = keyword.trim().toLowerCase()
    const categories = categoriesQuery.data ?? []
    const selectedCategoryName = selectedCategoryId
      ? categories.find((c) => c.id === selectedCategoryId)?.name.toLowerCase() ?? ''
      : ''

    const localFiltered = adminItems.filter((item) => {
      const keywordOk =
        !q ||
        [item.name, item.address, item.city, item.country]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))

      if (!keywordOk) return false

      if (!selectedCategoryId) return true
      if (item.category === selectedCategoryId) return true
      if (item.categoryName && item.categoryName.toLowerCase() === selectedCategoryName) return true
      return false
    })

    const matchedPublishedIds = new Set((searchQuery.data?.items ?? []).map((item) => item.id))

    if (isPublishedTab) {
      return localFiltered.filter((item) => matchedPublishedIds.has(item.id))
    }

    if (isAllTab) {
      return localFiltered.filter((item) => {
        if (item.status === 'published') return matchedPublishedIds.has(item.id)
        return true
      })
    }

    return localFiltered
  }, [
    places.data,
    searchQuery.data?.items,
    keyword,
    selectedCategoryId,
    categoriesQuery.data,
    isAllTab,
    isPublishedTab,
  ])

  const paginatedPlaces = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return tablePlaces.slice(start, end)
  }, [page, pageSize, tablePlaces])

  const totalPages = Math.max(1, Math.ceil(tablePlaces.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [status, keyword, selectedCategoryId])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return (
    <AdminLayout>
      <div className="p-container-padding max-w-7xl mx-auto space-y-8">
        <div className="relative h-[220px] rounded-xl overflow-hidden">
          <img
            alt="Hero Landscape"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-scrim/80 via-scrim/20 to-transparent flex flex-col justify-end p-8">
            <h2 className="font-display-lg text-on-media mb-2">Curate the World</h2>
            <p className="text-on-media/80 max-w-xl font-body-base">
              Manage global destinations, verify quality standards, and publish curated locations.
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
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                {s === 'all' ? 'All Places' : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <form className="flex items-center gap-2 w-full md:max-w-xl" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                search
              </span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search places..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success"
            >
              <option value="">All categories</option>
              {(categoriesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {(keyword || selectedCategoryId) && (
              <Button
                type="button"
                variant="ghost"
                className="py-2 px-3 text-xs"
                onClick={() => {
                  setKeyword('')
                  setSelectedCategoryId('')
                  setPage(1)
                }}
              >
                CLEAR
              </Button>
            )}
          </div>
        </div>

        {places.isError && <Alert variant="error" message="Failed to load admin places." />}
        {searchQuery.isError && (
          <Alert variant="error" message="Search API failed. Please try again." />
        )}

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">Place</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">
                  {isRejectedTab || isDeletedTab ? 'Request Info' : 'Location'}
                </th>
                {isAllTab && (
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">
                    Address
                  </th>
                )}
                {isAllTab && (
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">
                    Category
                  </th>
                )}
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">Status</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginatedPlaces.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary">{p.name}</div>
                    <p className="text-[10px] text-secondary">ID: {p.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {isRejectedTab || isDeletedTab ? (
                      <div className="space-y-1">
                        <p className="text-xs text-on-surface">
                          Reason: {p.deletedReason ?? (isDeletedTab ? 'Deleted by admin' : 'Rejected by admin')}
                        </p>
                        <p className="text-xs text-secondary">
                          Rejected at: {formatDate(p.updatedAt)}
                        </p>
                        <p className="text-xs text-secondary">
                          Deleted at: {formatDate(p.deletedAt ?? p.updatedAt)}
                        </p>
                      </div>
                    ) : (
                      ([p.city, p.country].filter(Boolean).join(', ') || '-')
                    )}
                  </td>
                  {isAllTab && (
                    <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[320px] truncate">
                      {p.address ?? '-'}
                    </td>
                  )}
                  {isAllTab && (
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {resolveCategoryLabel(p.category, p.categoryName)}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'published'
                          ? 'bg-success/15 text-success'
                          : p.status === 'pending'
                            ? 'bg-accent-highlight/35 text-primary'
                            : 'bg-error-container text-error'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {isPendingTab && (
                        <>
                          <Button
                            variant="ghost"
                            className="py-1.5 px-3 text-xs"
                            disabled={approve.isPending}
                            onClick={() => setConfirmAction({ type: 'approve', place: p })}
                          >
                            APPROVE
                          </Button>
                          <Button
                            variant="ghost"
                            className="py-1.5 px-3 text-xs"
                            disabled={reject.isPending}
                            onClick={() => {
                              setRejectingPlace(p)
                              setRejectReason('')
                            }}
                          >
                            REJECT
                          </Button>
                        </>
                      )}

                      {isPublishedTab && (
                        <>
                          <Button
                            variant="ghost"
                            className="py-1.5 px-3 text-xs"
                            onClick={() => setEditingPlace(p)}
                            disabled={updatePlace.isPending}
                          >
                            EDIT
                          </Button>
                          <Button
                            variant="ghost"
                            className="py-1.5 px-3 text-xs"
                            onClick={() => setDetailPlace(p)}
                          >
                            DETAIL
                          </Button>
                          <Button
                            variant="ghost"
                            className="py-1.5 px-3 text-xs text-error"
                            onClick={() => setConfirmAction({ type: 'delete', place: p })}
                            disabled={deletePlace.isPending}
                          >
                            DELETE
                          </Button>
                        </>
                      )}

                      {isDeletedTab && (
                        <Button
                          variant="ghost"
                          className="py-1.5 px-3 text-xs text-success"
                          onClick={() => restorePlace.mutate(p.id)}
                          disabled={restorePlace.isPending}
                        >
                          RESTORE
                        </Button>
                      )}

                      {(isAllTab || isRejectedTab) && (
                        <span className="text-xs text-secondary">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!places.isLoading && !searchQuery.isLoading && tablePlaces.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-on-surface-variant"
                    colSpan={isAllTab ? 6 : 4}
                  >
                    No places found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {tablePlaces.length > 0 && (
            <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between">
              <p className="text-xs text-secondary">
                Showing{' '}
                <span className="font-semibold text-on-surface">
                  {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, tablePlaces.length)}
                </span>{' '}
                of <span className="font-semibold text-on-surface">{tablePlaces.length}</span> places
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="py-1.5 px-3 text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  PREV
                </Button>
                <span className="text-xs text-secondary">
                  Page {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="py-1.5 px-3 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  NEXT
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {detailPlace && (
        <div className="fixed inset-0 z-[70] bg-scrim/45 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant shadow-xl">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-primary">Place Detail</h3>
              <button
                type="button"
                onClick={() => setDetailPlace(null)}
                className="font-label-caps text-[11px] tracking-wider text-on-surface-variant hover:text-primary"
              >
                CLOSE ✕
              </button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
              <p><span className="font-semibold">Name:</span> {detailPlace.name}</p>
              <p><span className="font-semibold">Status:</span> {detailPlace.status}</p>
              <p className="col-span-2"><span className="font-semibold">Address:</span> {detailPlace.address ?? '-'}</p>
              <p><span className="font-semibold">Category:</span> {resolveCategoryLabel(detailPlace.category, detailPlace.categoryName)}</p>
              <p><span className="font-semibold">Location:</span> {[detailPlace.city, detailPlace.country].filter(Boolean).join(', ') || '-'}</p>
              <p><span className="font-semibold">Lat/Lng:</span> {detailPlace.lat ?? '-'} / {detailPlace.lng ?? '-'}</p>
              <p className="col-span-2"><span className="font-semibold">Description:</span> {detailPlace.description ?? '-'}</p>
              <p className="col-span-2"><span className="font-semibold">Thumbnail URL:</span> {detailPlace.thumbnailUrl ?? '-'}</p>
              <p className="col-span-2"><span className="font-semibold">Image URL:</span> {detailPlace.imageUrl ?? '-'}</p>
            </div>
          </div>
        </div>
      )}

      {editingPlace && (
        <div className="fixed inset-0 z-[75] bg-scrim/45 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant shadow-xl">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-primary">Edit Place</h3>
              <button
                type="button"
                onClick={() => {
                  if (isDirty) {
                    setConfirmAction({ type: 'cancel-edit' })
                  } else {
                    setEditingPlace(null)
                  }
                }}
                className="font-label-caps text-[11px] tracking-wider text-on-surface-variant hover:text-primary"
              >
                CLOSE ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit((values: EditPlaceValues) =>
                setConfirmAction({ type: 'save-edit', place: editingPlace, values }),
              )}
              className="px-6 py-5 space-y-4"
              noValidate
            >
              {updatePlace.isError && (
                <Alert variant="error" message="Failed to update place." />
              )}
              <div className="grid grid-cols-2 gap-4">
                <DynamicFormFields
                  fields={[
                    { name: 'name', label: 'NAME', type: 'text', placeholder: 'Place name', wrapperClassName: 'col-span-1' },
                    {
                      name: 'category',
                      label: 'CATEGORY',
                      type: 'select',
                      wrapperClassName: 'col-span-1',
                      options: (categoriesQuery.data ?? []).map((c) => ({ value: c.id, label: c.name })),
                    },
                  ]}
                  register={register}
                  errors={errors}
                />
              </div>
              <DynamicFormFields
                fields={[
                  { name: 'address', label: 'ADDRESS', type: 'text', placeholder: 'Address' },
                  { name: 'thumbnailUrl', label: 'THUMBNAIL URL', type: 'text', placeholder: 'https://...' },
                  { name: 'imageUrl', label: 'IMAGE URL', type: 'text', placeholder: 'https://...' },
                  { name: 'description', label: 'DESCRIPTION', type: 'textarea', placeholder: 'Description...' },
                ]}
                register={register}
                errors={errors}
              />
              <div className="pt-2 flex gap-3">
                <Button type="submit" fullWidth isLoading={updatePlace.isPending}>
                  SAVE
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (isDirty) {
                      setConfirmAction({ type: 'cancel-edit' })
                    } else {
                      setEditingPlace(null)
                    }
                  }}
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rejectingPlace && (
        <div className="fixed inset-0 z-[78] bg-scrim/45 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant shadow-xl">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-primary">Reject Place Request</h3>
              <button
                type="button"
                onClick={() => {
                  setRejectingPlace(null)
                  setRejectReason('')
                }}
                className="font-label-caps text-[11px] tracking-wider text-on-surface-variant hover:text-primary"
              >
                CLOSE ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-on-surface-variant">
                Request: <span className="font-semibold text-on-surface">{rejectingPlace.name}</span>
              </p>
              <div className="space-y-unit">
                <label className="font-label-caps text-label-caps text-on-surface-variant block">
                  REJECT REASON
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full min-h-[120px] px-4 py-3 bg-surface-container-lowest border border-outline-variant focus:outline-none focus:border-primary font-body-md"
                  placeholder="Please enter reason for rejection..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRejectingPlace(null)
                  setRejectReason('')
                }}
                disabled={reject.isPending}
              >
                CANCEL
              </Button>
              <Button
                type="button"
                isLoading={reject.isPending}
                disabled={!rejectReason.trim()}
                onClick={() => {
                  if (!rejectReason.trim()) return
                  reject.mutate(
                    { id: rejectingPlace.id, reason: rejectReason.trim() },
                    {
                      onSuccess: () => {
                        setRejectingPlace(null)
                        setRejectReason('')
                      },
                    },
                  )
                }}
              >
                CONFIRM REJECT
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === 'save-edit'
            ? 'Confirm Save Changes'
            : confirmAction?.type === 'cancel-edit'
              ? 'Discard Changes'
              : confirmAction?.type === 'delete'
                ? 'Delete Place'
                : confirmAction?.type === 'approve'
                  ? 'Approve Place'
                  : 'Confirm Action'
        }
        message={
          confirmAction?.type === 'save-edit'
            ? 'Are you sure you want to save these place updates?'
            : confirmAction?.type === 'cancel-edit'
              ? 'You have unsaved changes. Are you sure you want to cancel editing?'
              : confirmAction?.type === 'delete'
                ? `Are you sure you want to delete "${confirmAction.place.name}"?`
                : confirmAction?.type === 'approve'
                  ? `Approve "${confirmAction.place.name}"?`
                  : ''
        }
        confirmText={
          confirmAction?.type === 'save-edit'
            ? 'SAVE'
            : confirmAction?.type === 'cancel-edit'
              ? 'DISCARD'
              : confirmAction?.type === 'approve'
                ? 'APPROVE'
                : 'DELETE'
        }
        isDanger={
          confirmAction?.type === 'delete' ||
          confirmAction?.type === 'cancel-edit'
        }
        isLoading={
          updatePlace.isPending ||
          deletePlace.isPending ||
          approve.isPending ||
          reject.isPending ||
          restorePlace.isPending
        }
        onConfirm={executeConfirmAction}
        onClose={() => setConfirmAction(null)}
      />
    </AdminLayout>
  )
}
