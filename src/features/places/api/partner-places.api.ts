import { apiClient } from '@/core/api/axios'
import { unwrapApiData } from '@/core/api/envelope'
import type {
  CreatePlaceRequestDto,
  PartnerPlaceItem,
} from '@/features/places/types/places.types'

function mapRequestStatus(status: unknown): PartnerPlaceItem['status'] {
  const value = String(status ?? '').toUpperCase()
  if (value === 'APPROVED') return 'published'
  if (value === 'REJECTED') return 'rejected'
  return 'pending'
}

function normalizeRegistrationRequest(input: unknown): PartnerPlaceItem {
  const p = (input ?? {}) as Record<string, unknown>
  const imageUrls = Array.isArray(p.imageUrls) ? (p.imageUrls as string[]) : []

  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    description: typeof p.description === 'string' ? p.description : null,
    address: String(p.address ?? ''),
    lat: Number(p.lat ?? 0),
    lng: Number(p.lng ?? 0),
    category: typeof p.categoryId === 'string' ? p.categoryId : null,
    tags: [],
    status: mapRequestStatus(p.status),
    thumbnailUrl: typeof p.thumbnailUrl === 'string' ? p.thumbnailUrl : null,
    imageUrl: imageUrls[0] ?? (typeof p.imageUrl === 'string' ? p.imageUrl : null),
    deletedAt: typeof p.deletedAt === 'string' ? p.deletedAt : null,
    deletedReason:
      typeof p.rejectionReason === 'string'
        ? p.rejectionReason
        : typeof p.deletedReason === 'string'
          ? p.deletedReason
          : null,
  }
}

export const partnerPlacesApi = {
  listMyPlaces: async (): Promise<PartnerPlaceItem[]> => {
    const res = await apiClient.get('/user/place-requests', {
      params: { page: 1, limit: 100 },
    })
    const payload = unwrapApiData<{ items?: unknown[] }>(res.data)
    const items = Array.isArray(payload?.items) ? payload.items : []
    return items.map(normalizeRegistrationRequest)
  },

  createPlaceRequest: async (dto: CreatePlaceRequestDto): Promise<void> => {
    await apiClient.post('/user/place-requests', {
      name: dto.name,
      description: dto.description ?? null,
      address: dto.address,
      lat: String(dto.lat),
      lng: String(dto.lng),
      categoryId: dto.category,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      imageUrls: dto.imageUrl ? [dto.imageUrl] : undefined,
      ...(dto.destinationId ? { destinationId: dto.destinationId } : {}),
    })
  },
}
