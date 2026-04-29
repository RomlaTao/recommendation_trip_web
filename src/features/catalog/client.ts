import { apiClient } from '@/core/api/axios'
import type {
  PaginatedPlacesResponse,
  PlaceCategory,
  PlacesQuery,
} from '@/features/catalog/contracts'

export async function getPlaces(query: PlacesQuery): Promise<PaginatedPlacesResponse> {
  const response = await apiClient.get<PaginatedPlacesResponse>('/places', {
    params: {
      q: query.q,
      categoryId: query.categoryId,
      minRating: query.minRating,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    },
  })

  return response.data
}

export async function getPlaceCategories(): Promise<PlaceCategory[]> {
  const response = await apiClient.get<PlaceCategory[]>('/places/categories')
  return response.data
}
