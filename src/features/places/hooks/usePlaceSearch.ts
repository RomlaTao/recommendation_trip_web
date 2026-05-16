import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { placesApi } from '@/features/places/api/places.api'
import type { PlaceSort } from '@/features/places/types/places.types'

interface UsePlaceSearchState {
  q: string
  categoryId?: string
  minRating?: number
  sort: PlaceSort
  page: number
  limit: number
}

const initialState: UsePlaceSearchState = {
  q: '',
  categoryId: undefined,
  minRating: undefined,
  sort: 'newest',
  page: 1,
  limit: 12,
}

/**
 * All search/filter/pagination state lives here.
 * UI components receive only state + handlers and stay render-focused.
 */
export function usePlaceSearch(initialKeyword = '') {
  const [state, setState] = useState<UsePlaceSearchState>({
    ...initialState,
    q: initialKeyword,
  })

  const categoriesQuery = useQuery({
    queryKey: ['places', 'categories'],
    queryFn: placesApi.categories,
  })

  const placesQuery = useQuery({
    queryKey: ['places', 'search', state],
    queryFn: () =>
      placesApi.search({
        q: state.q || undefined,
        categoryId: state.categoryId,
        minRating: state.minRating,
        sort: state.sort,
        page: state.page,
        limit: state.limit,
      }),
  })

  const nearbyQuery = useQuery({
    queryKey: ['places', 'nearby'],
    enabled: false,
    queryFn: () =>
      placesApi.nearby({
        lat: 10.7769,
        lng: 106.7009,
        radiusInMeters: 5000,
        limit: 10,
      }),
  })

  const actions = useMemo(
    () => ({
      setKeyword: (q: string) =>
        setState((prev) => ({ ...prev, q, page: 1 })),
      setCategory: (categoryId?: string) =>
        setState((prev) => ({ ...prev, categoryId, page: 1 })),
      setMinRating: (minRating?: number) =>
        setState((prev) => ({ ...prev, minRating, page: 1 })),
      setSort: (sort: PlaceSort) =>
        setState((prev) => ({ ...prev, sort, page: 1 })),
      setPage: (page: number) =>
        setState((prev) => ({ ...prev, page })),
      resetFilters: () => setState(initialState),
      fetchNearby: () => nearbyQuery.refetch(),
    }),
    [nearbyQuery],
  )

  return {
    state,
    placesQuery,
    categoriesQuery,
    nearbyQuery,
    ...actions,
  }
}
