import { apiClient, type ApiError } from '@/core/api/axios'
import { unwrapApiData } from '@/core/api/envelope'
import type { AdminPlace, AdminReview, AdminReviewsResponse } from '@/features/admin/types/admin.types'

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as ApiError).statusCode === 'number'
  )
}

function pickItems(payload: unknown): unknown[] {
  const data = unwrapApiData<{ items?: unknown[] }>(payload)
  return Array.isArray(data?.items) ? data.items : []
}

function normalizeRegistrationRequest(input: unknown): AdminPlace {
  const p = (input ?? {}) as Record<string, unknown>
  const status = String(p.status ?? '').toUpperCase()
  const imageUrls = Array.isArray(p.imageUrls) ? (p.imageUrls as string[]) : []

  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? 'Unnamed place'),
    description: typeof p.description === 'string' ? p.description : null,
    status:
      status === 'APPROVED'
        ? 'published'
        : status === 'REJECTED'
          ? 'rejected'
          : 'pending',
    address: typeof p.address === 'string' ? p.address : undefined,
    lat: Number(p.lat ?? 0),
    lng: Number(p.lng ?? 0),
    category: typeof p.categoryId === 'string' ? p.categoryId : undefined,
    thumbnailUrl: typeof p.thumbnailUrl === 'string' ? p.thumbnailUrl : null,
    imageUrl: imageUrls[0] ?? null,
    deletedReason:
      typeof p.rejectionReason === 'string' ? p.rejectionReason : null,
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : undefined,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : undefined,
  }
}

function normalizePlaceRow(input: unknown): AdminPlace {
  const p = (input ?? {}) as Record<string, unknown>
  const dbStatus = String(p.status ?? '').toUpperCase()
  const imageUrls = Array.isArray(p.imageUrls) ? (p.imageUrls as string[]) : []

  let status = 'pending'
  if (p.deletedAt) {
    status = 'deleted'
  } else if (dbStatus === 'APPROVED') {
    status = 'published'
  } else if (dbStatus === 'REJECTED') {
    status = 'rejected'
  } else if (dbStatus === 'PENDING_REVIEW') {
    status = 'pending'
  }

  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? 'Unnamed place'),
    description: typeof p.description === 'string' ? p.description : null,
    status,
    address: typeof p.address === 'string' ? p.address : undefined,
    lat: Number(p.lat ?? 0),
    lng: Number(p.lng ?? 0),
    category: typeof p.categoryId === 'string' ? p.categoryId : undefined,
    thumbnailUrl: typeof p.thumbnailUrl === 'string' ? p.thumbnailUrl : null,
    imageUrl: imageUrls[0] ?? null,
    deletedAt:
      typeof p.deletedAt === 'string'
        ? p.deletedAt
        : p.deletedAt instanceof Date
          ? p.deletedAt.toISOString()
          : null,
    deletedReason: typeof p.deletedReason === 'string' ? p.deletedReason : null,
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : undefined,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : undefined,
  }
}

async function listRegistrationRequests(
  status?: 'PENDING' | 'REJECTED' | 'APPROVED',
): Promise<AdminPlace[]> {
  const res = await apiClient.get('/admin/places/requests/list', {
    params: { status, page: 1, limit: 100 },
  })
  return pickItems(res.data).map(normalizeRegistrationRequest)
}

/** Catalog fallback when Docker/API has not been rebuilt with GET /admin/places yet. */
async function listPublishedFromCatalog(): Promise<AdminPlace[]> {
  const res = await apiClient.get('/places', { params: { page: 1, limit: 100 } })
  const data = unwrapApiData<{ items?: unknown[] }>(res.data)
  const items = Array.isArray(data?.items) ? data.items : []
  return items.map((row) => {
    const p = (row ?? {}) as Record<string, unknown>
    const imageUrls = Array.isArray(p.imageUrls) ? (p.imageUrls as string[]) : []
    return {
      id: String(p.id ?? ''),
      name: String(p.name ?? 'Unnamed place'),
      description: null,
      status: 'published' as const,
      address: typeof p.address === 'string' ? p.address : undefined,
      lat: Number(p.lat ?? 0),
      lng: Number(p.lng ?? 0),
      category: typeof p.categoryId === 'string' ? p.categoryId : undefined,
      categoryName: typeof p.categoryName === 'string' ? p.categoryName : undefined,
      thumbnailUrl: typeof p.thumbnailUrl === 'string' ? p.thumbnailUrl : null,
      imageUrl: imageUrls[0] ?? null,
    }
  })
}

async function listManagedPlaces(params: {
  status?: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' | 'DRAFT'
  includeDeleted?: boolean
}): Promise<AdminPlace[]> {
  try {
    const res = await apiClient.get('/admin/places', {
      params: {
        status: params.status,
        includeDeleted: params.includeDeleted ? 'true' : undefined,
        page: 1,
        limit: 100,
      },
    })
    return pickItems(res.data).map(normalizePlaceRow)
  } catch (error) {
    if (isApiError(error) && error.statusCode === 404) {
      if (params.status === 'APPROVED' && !params.includeDeleted) {
        return listPublishedFromCatalog()
      }
      return []
    }
    throw error
  }
}

export const adminApi = {
  listPlaces: async (status?: string): Promise<AdminPlace[]> => {
    if (status === 'pending') {
      return listRegistrationRequests('PENDING')
    }
    if (status === 'rejected') {
      return listRegistrationRequests('REJECTED')
    }
    if (status === 'published') {
      return listManagedPlaces({ status: 'APPROVED' })
    }
    if (status === 'deleted') {
      return listManagedPlaces({ includeDeleted: true })
    }
    if (status === 'all' || !status) {
      const [pending, published, rejected, deleted] = await Promise.all([
        listRegistrationRequests('PENDING'),
        listManagedPlaces({ status: 'APPROVED' }),
        listRegistrationRequests('REJECTED'),
        listManagedPlaces({ includeDeleted: true }),
      ])
      const merged = new Map<string, AdminPlace>()
      for (const row of [...pending, ...published, ...rejected, ...deleted]) {
        merged.set(row.id, row)
      }
      return [...merged.values()]
    }
    return listManagedPlaces({})
  },

  listPendingPlaces: async (): Promise<AdminPlace[]> => {
    const res = await apiClient.get('/admin/places/requests/pending')
    return pickItems(res.data).map(normalizeRegistrationRequest)
  },

  approvePlace: async (requestId: string): Promise<void> => {
    await apiClient.patch(`/admin/places/requests/${requestId}/approve`, {})
  },

  rejectPlace: async (requestId: string, reason: string): Promise<void> => {
    await apiClient.patch(`/admin/places/requests/${requestId}/reject`, {
      reason,
    })
  },

  updatePlace: async (
    id: string,
    dto: {
      name?: string
      description?: string
      address?: string
      category?: string
      thumbnailUrl?: string
      imageUrl?: string
    },
  ): Promise<void> => {
    await apiClient.patch(`/admin/places/${id}`, {
      name: dto.name,
      description: dto.description,
      address: dto.address,
      categoryId: dto.category,
      thumbnailUrl: dto.thumbnailUrl,
      imageUrls: dto.imageUrl ? [dto.imageUrl] : undefined,
    })
  },

  deletePlace: async (id: string, reason: string): Promise<void> => {
    await apiClient.delete(`/admin/places/${id}`, { data: { reason } })
  },

  restorePlace: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/places/${id}/restore`, {})
  },

  listReviews: async (params: {
    page: number
    limit: number
    q?: string
    rating?: number
    status?: 'all' | 'active' | 'deleted'
  }): Promise<AdminReviewsResponse> => {
    const res = await apiClient.get('/admin/reviews', { params })
    const data = unwrapApiData<{
      items?: unknown[]
      total?: number
      page?: number
      limit?: number
    }>(res.data)
    const items = Array.isArray(data.items) ? data.items.map(normalizeReview) : []
    return {
      items,
      total: Number(data.total ?? items.length),
      page: Number(data.page ?? params.page),
      limit: Number(data.limit ?? params.limit),
    }
  },

  softDeleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${reviewId}`)
  },

  restoreReview: async (reviewId: string): Promise<void> => {
    await apiClient.patch(`/admin/reviews/${reviewId}/restore`, {})
  },
}

function normalizeReview(input: unknown): AdminReview {
  const r = (input ?? {}) as Record<string, unknown>
  const deletedAt =
    typeof r.deletedAt === 'string'
      ? r.deletedAt
      : r.deletedAt instanceof Date
        ? r.deletedAt.toISOString()
        : null

  return {
    id: String(r.id ?? ''),
    placeId: String(r.placeId ?? ''),
    placeName: typeof r.placeName === 'string' ? r.placeName : '-',
    userId: String(r.userId ?? ''),
    authorName: typeof r.authorName === 'string' ? r.authorName : 'unknown',
    rating: Number(r.rating ?? 0),
    comment: typeof r.comment === 'string' ? r.comment : null,
    status: deletedAt ? 'deleted' : 'active',
    createdAt: String(r.createdAt ?? ''),
    updatedAt: String(r.updatedAt ?? ''),
    deletedAt,
  }
}
