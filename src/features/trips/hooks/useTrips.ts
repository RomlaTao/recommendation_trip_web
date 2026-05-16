import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tripsApi } from '@/features/trips/api/trips.api'
import type {
  AddTripDayInput,
  AddTripItemInput,
  CreateTripInput,
} from '@/features/trips/types/trips.types'

export function useMyTrips() {
  return useQuery({
    queryKey: ['trips', 'mine'],
    queryFn: tripsApi.listMine,
  })
}

export function useTripDetail(tripId?: string) {
  return useQuery({
    queryKey: ['trips', 'detail', tripId],
    queryFn: () => tripsApi.getById(tripId as string),
    enabled: Boolean(tripId),
  })
}

/** Canonical itinerary + flat `events[]` for calendar/grid UI (`GET .../itinerary-view`). */
export function useTripItineraryView(tripId?: string) {
  return useQuery({
    queryKey: ['trips', 'itinerary-view', tripId],
    queryFn: () => tripsApi.getItineraryView(tripId as string),
    enabled: Boolean(tripId),
  })
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTripInput) => tripsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', 'mine'] }),
  })
}

export function useDeleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tripId: string) => tripsApi.deleteTrip(tripId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', 'mine'] })
      qc.invalidateQueries({ queryKey: ['trips', 'detail'] })
      qc.invalidateQueries({ queryKey: ['trips', 'itinerary-view'] })
    },
  })
}

function invalidateTripCaches(qc: ReturnType<typeof useQueryClient>, tripId: string) {
  qc.invalidateQueries({ queryKey: ['trips', 'detail', tripId] })
  qc.invalidateQueries({ queryKey: ['trips', 'itinerary-view', tripId] })
}

export function useAddTripDay(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddTripDayInput) => tripsApi.addDay(tripId, dto),
    onSuccess: () => invalidateTripCaches(qc, tripId),
  })
}

export function useDeleteTripDay(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dayId: string) => tripsApi.deleteDay(tripId, dayId),
    onSuccess: () => invalidateTripCaches(qc, tripId),
  })
}

export function useAddTripItem(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ dayId, dto }: { dayId: string; dto: AddTripItemInput }) =>
      tripsApi.addItem(tripId, dayId, dto),
    onSuccess: () => invalidateTripCaches(qc, tripId),
  })
}

export function useDeleteTripItem(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ dayId, itemId }: { dayId: string; itemId: string }) =>
      tripsApi.deleteItem(tripId, dayId, itemId),
    onSuccess: () => invalidateTripCaches(qc, tripId),
  })
}
