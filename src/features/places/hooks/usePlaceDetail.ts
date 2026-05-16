import { useQuery } from '@tanstack/react-query'
import { placesApi } from '@/features/places/api/places.api'

export function usePlaceDetail(id: string) {
  return useQuery({
    queryKey: ['places', 'detail', id],
    queryFn: () => placesApi.getById(id),
    enabled: !!id,
  })
}
