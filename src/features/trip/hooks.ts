import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addTripDay,
  addTripItem,
  createTrip,
  getMyTrips,
  getPublicTripDetail,
  getPublicTrips,
  getTripDetail,
  removeTripDay,
  removeTripItem,
  rescheduleTripItem,
  updateTripDay,
  updateTripItem,
} from '@/features/trip/client'
import type {
  AddTripDayPayload,
  AddTripItemPayload,
  CreateTripPayload,
  RescheduleTripItemPayload,
  TripsQuery,
  UpdateTripDayPayload,
  UpdateTripItemPayload,
} from '@/features/trip/contracts'

const defaultQuery: Required<TripsQuery> = {
  page: 1,
  limit: 12,
}

function normalizeTripsQuery(query: TripsQuery) {
  return {
    page: query.page ?? defaultQuery.page,
    limit: query.limit ?? defaultQuery.limit,
  }
}

export const tripQueryKeys = {
  all: ['trip'] as const,
  mine: (query: TripsQuery) => [...tripQueryKeys.all, 'mine', normalizeTripsQuery(query)] as const,
  public: (query: TripsQuery) => [...tripQueryKeys.all, 'public', normalizeTripsQuery(query)] as const,
  detail: (tripId: string) => [...tripQueryKeys.all, 'detail', tripId] as const,
  publicDetail: (tripId: string) => [...tripQueryKeys.all, 'publicDetail', tripId] as const,
}

export function useMyTripsQuery(query: TripsQuery) {
  const normalized = normalizeTripsQuery(query)

  return useQuery({
    queryKey: tripQueryKeys.mine(normalized),
    queryFn: () => getMyTrips(normalized),
  })
}

export function usePublicTripsQuery(query: TripsQuery) {
  const normalized = normalizeTripsQuery(query)

  return useQuery({
    queryKey: tripQueryKeys.public(normalized),
    queryFn: () => getPublicTrips(normalized),
  })
}

export function useTripDetailQuery(tripId: string | undefined) {
  return useQuery({
    queryKey: tripQueryKeys.detail(tripId ?? ''),
    queryFn: () => getTripDetail(tripId ?? ''),
    enabled: Boolean(tripId),
  })
}

export function usePublicTripDetailQuery(tripId: string | undefined) {
  return useQuery({
    queryKey: tripQueryKeys.publicDetail(tripId ?? ''),
    queryFn: () => getPublicTripDetail(tripId ?? ''),
    enabled: Boolean(tripId),
  })
}

export function useCreateTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTripPayload) => createTrip(payload),
    onSuccess: async (trip) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.all }),
        queryClient.setQueryData(tripQueryKeys.detail(trip.id), trip),
      ])
    },
  })
}

export function useAddTripDayMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, payload }: { tripId: string; payload: AddTripDayPayload }) => addTripDay(tripId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(variables.tripId) })
    },
  })
}

export function useUpdateTripDayMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, dayId, payload }: { tripId: string; dayId: string; payload: UpdateTripDayPayload }) =>
      updateTripDay(tripId, dayId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(variables.tripId) })
    },
  })
}

export function useRemoveTripDayMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, dayId }: { tripId: string; dayId: string }) => removeTripDay(tripId, dayId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(variables.tripId) })
    },
  })
}

export function useAddTripItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, dayId, payload }: { tripId: string; dayId: string; payload: AddTripItemPayload }) =>
      addTripItem(tripId, dayId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(variables.tripId) })
    },
  })
}

export function useUpdateTripItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tripId,
      dayId,
      itemId,
      payload,
    }: {
      tripId: string
      dayId: string
      itemId: string
      payload: UpdateTripItemPayload
    }) => updateTripItem(tripId, dayId, itemId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(variables.tripId) })
    },
  })
}

export function useRescheduleTripItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tripId,
      dayId,
      itemId,
      payload,
    }: {
      tripId: string
      dayId: string
      itemId: string
      payload: RescheduleTripItemPayload
    }) => rescheduleTripItem(tripId, dayId, itemId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(variables.tripId) })
    },
  })
}

export function useRemoveTripItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, dayId, itemId }: { tripId: string; dayId: string; itemId: string }) =>
      removeTripItem(tripId, dayId, itemId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(variables.tripId) })
    },
  })
}
