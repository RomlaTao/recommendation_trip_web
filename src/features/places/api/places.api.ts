import { apiClient } from '@/core/api/axios'
import { unwrapApiData } from '@/core/api/envelope'
import type {
  NearbyPlace,
  NearbyPlacesParams,
  PaginatedPlaceReviews,
  PaginatedPlaces,
  PlaceCategory,
  PlaceDestination,
  PlaceDetail,
  PlaceListItem,
  PlaceReview,
  SearchPlacesParams,
  UpdatePlaceReviewDto,
  UpsertPlaceReviewDto,
} from '@/features/places/types/places.types'

function pickPayload<T>(raw: unknown): T {
  return unwrapApiData<T>(raw)
}

function toListRows(payload: unknown): unknown[] {
  const unwrapped = unwrapApiData<unknown>(payload)
  if (Array.isArray(unwrapped)) {
    return unwrapped
  }
  if (unwrapped && typeof unwrapped === 'object') {
    const nested = unwrapped as Record<string, unknown>
    if (Array.isArray(nested.data)) {
      return nested.data
    }
    if (Array.isArray(nested.items)) {
      return nested.items
    }
  }
  return []
}

function normalizeDestination(row: unknown): PlaceDestination {
  const r = (row ?? {}) as Record<string, unknown>
  return {
    id: String(r.id ?? r.d_id ?? ''),
    slug: String(r.slug ?? r.d_slug ?? ''),
    name: String(r.name ?? r.d_name ?? ''),
  }
}

function normalizePlaceItem(input: unknown): PlaceListItem {
  const p = (input ?? {}) as Record<string, unknown>
  const imageUrls = Array.isArray(p.imageUrls) ? (p.imageUrls as string[]) : null
  const thumbnailUrl =
    (typeof p.thumbnailUrl === 'string' && p.thumbnailUrl) ||
    (typeof p.thumbnail === 'string' && p.thumbnail) ||
    (typeof p.imageUrl === 'string' && p.imageUrl) ||
    (imageUrls?.[0] ?? null)

  let destination: PlaceListItem['destination'] = null
  const destRaw = p.destination as Record<string, unknown> | null | undefined
  if (destRaw && typeof destRaw.id === 'string') {
    destination = {
      id: destRaw.id,
      slug: typeof destRaw.slug === 'string' ? destRaw.slug : '',
      name: typeof destRaw.name === 'string' ? destRaw.name : '',
    }
  }

  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    address: String(p.address ?? ''),
    lat: Number(p.lat ?? 0),
    lng: Number(p.lng ?? 0),
    thumbnailUrl,
    categoryId: typeof p.categoryId === 'string' ? p.categoryId : null,
    categoryName: typeof p.categoryName === 'string' ? p.categoryName : null,
    destination,
    communityRating: {
      averageRating:
        p.communityRating && typeof p.communityRating === 'object'
          ? (((p.communityRating as Record<string, unknown>).averageRating as number | null | undefined) ?? null)
          : null,
      reviewCount:
        p.communityRating && typeof p.communityRating === 'object'
          ? Number((p.communityRating as Record<string, unknown>).reviewCount ?? 0)
          : 0,
    },
    seedRating: {
      averageRating:
        p.seedRating && typeof p.seedRating === 'object'
          ? (((p.seedRating as Record<string, unknown>).averageRating as number | null | undefined) ?? null)
          : null,
      reviewCount:
        p.seedRating && typeof p.seedRating === 'object'
          ? Number((p.seedRating as Record<string, unknown>).reviewCount ?? 0)
          : 0,
    },
  }
}

function normalizeCategory(input: unknown): PlaceCategory {
  const r = (input ?? {}) as Record<string, unknown>
  const parentId = r.parentId
  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    slug: String(r.slug ?? ''),
    parentId: typeof parentId === 'string' ? parentId : null,
  }
}

function normalizeReview(input: unknown): PlaceReview {
  const r = (input ?? {}) as Record<string, unknown>
  return {
    id: String(r.id ?? ''),
    placeId: String(r.placeId ?? ''),
    userId: String(r.userId ?? ''),
    rating: Number(r.rating ?? 0),
    comment: typeof r.comment === 'string' ? r.comment : null,
    imageUrls: Array.isArray(r.imageUrls) ? (r.imageUrls as string[]) : null,
    createdAt: String(r.createdAt ?? ''),
    updatedAt: String(r.updatedAt ?? ''),
  }
}

export const placesApi = {
  search: async (params: SearchPlacesParams): Promise<PaginatedPlaces> => {
    const res = await apiClient.get('/places', { params })
    const payload = pickPayload<PaginatedPlaces | { items?: unknown[]; total?: number; page?: number; limit?: number }>(res.data)
    const itemsRaw = Array.isArray((payload as { items?: unknown[] }).items)
      ? ((payload as { items: unknown[] }).items)
      : []

    return {
      items: itemsRaw.map(normalizePlaceItem),
      total: Number((payload as { total?: number }).total ?? 0),
      page: Number((payload as { page?: number }).page ?? 1),
      limit: Number((payload as { limit?: number }).limit ?? params.limit ?? 12),
    }
  },

  nearby: async (params: NearbyPlacesParams): Promise<NearbyPlace[]> => {
    const res = await apiClient.get('/places/nearby', { params })
    const payload = pickPayload<unknown[]>(res.data)
    return (Array.isArray(payload) ? payload : []).map((item) => {
      const base = normalizePlaceItem(item)
      const p = (item ?? {}) as Record<string, unknown>
      return {
        ...base,
        distanceInMeters: Number(p.distanceInMeters ?? 0),
      }
    })
  },

  categories: async (): Promise<PlaceCategory[]> => {
    const res = await apiClient.get('/places/categories')
    return toListRows(res.data).map(normalizeCategory)
  },

  destinations: async (): Promise<PlaceDestination[]> => {
    const res = await apiClient.get('/places/destinations')
    return toListRows(res.data).map(normalizeDestination)
  },

  getById: async (id: string): Promise<PlaceDetail> => {
    const res = await apiClient.get(`/places/${id}`)
    const payload = pickPayload<unknown>(res.data)
    const p = (payload ?? {}) as Record<string, unknown>
    const base = normalizePlaceItem(p)
    return {
      ...base,
      description: typeof p.description === 'string' ? p.description : null,
      imageUrls: Array.isArray(p.imageUrls) ? (p.imageUrls as string[]) : null,
    }
  },

  listReviews: async (
    placeId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedPlaceReviews> => {
    const res = await apiClient.get(`/places/${placeId}/reviews`, { params: { page, limit } })
    const payload = pickPayload<{
      items?: unknown[]
      total?: number
      page?: number
      limit?: number
    }>(res.data)
    const items = Array.isArray(payload.items) ? payload.items.map(normalizeReview) : []
    return {
      items,
      total: Number(payload.total ?? items.length),
      page: Number(payload.page ?? page),
      limit: Number(payload.limit ?? limit),
    }
  },

  createOrUpdateMyReview: async (
    placeId: string,
    dto: UpsertPlaceReviewDto,
  ): Promise<PlaceReview> => {
    const res = await apiClient.post(`/places/${placeId}/reviews`, dto)
    return normalizeReview(pickPayload<unknown>(res.data))
  },

  updateMyReviewById: async (
    reviewId: string,
    dto: UpdatePlaceReviewDto,
  ): Promise<PlaceReview> => {
    const res = await apiClient.patch(`/reviews/${reviewId}`, dto)
    return normalizeReview(pickPayload<unknown>(res.data))
  },

  deleteMyReviewById: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`)
  },
}
