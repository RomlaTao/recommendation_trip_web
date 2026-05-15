import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { partnerPlacesApi } from '@/features/places/api/partner-places.api'
import type { CreatePlaceRequestDto } from '@/features/places/types/places.types'

export function useMyPlaceRequests() {
  return useQuery({
    queryKey: ['user', 'place-requests', 'mine'],
    queryFn: partnerPlacesApi.listMyPlaces,
  })
}

export function useCreatePlaceRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePlaceRequestDto) => partnerPlacesApi.createPlaceRequest(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'place-requests', 'mine'] })
    },
  })
}
