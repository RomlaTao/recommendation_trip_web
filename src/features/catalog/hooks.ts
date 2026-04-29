import { useQuery } from '@tanstack/react-query'

import { getPlaceCategories, getPlaces } from '@/features/catalog/client'
import type { PlacesQuery } from '@/features/catalog/contracts'

const defaultQuery: Required<Pick<PlacesQuery, 'page' | 'limit' | 'sort'>> = {
  page: 1,
  limit: 12,
  sort: 'newest',
}

function normalizePlacesQuery(query: PlacesQuery) {
  return {
    q: query.q?.trim() ?? '',
    categoryId: query.categoryId ?? '',
    minRating: query.minRating,
    sort: query.sort ?? defaultQuery.sort,
    page: query.page ?? defaultQuery.page,
    limit: query.limit ?? defaultQuery.limit,
  }
}

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogQueryKeys.all, 'categories'] as const,
  places: (query: PlacesQuery) => [...catalogQueryKeys.all, 'places', normalizePlacesQuery(query)] as const,
}

export function usePlacesQuery(query: PlacesQuery) {
  const normalized = normalizePlacesQuery(query)

  return useQuery({
    queryKey: catalogQueryKeys.places(normalized),
    queryFn: () => getPlaces(normalized),
  })
}

export function usePlaceCategoriesQuery() {
  return useQuery({
    queryKey: catalogQueryKeys.categories(),
    queryFn: getPlaceCategories,
  })
}
