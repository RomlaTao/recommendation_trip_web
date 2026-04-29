import { apiClient } from '@/core/api/axios'
import type {
  AddTripDayPayload,
  AddTripItemPayload,
  CreateTripPayload,
  RescheduleTripItemPayload,
  TripResponse,
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

export async function getMyTrips(query: TripsQuery): Promise<TripResponse[]> {
  const response = await apiClient.get<TripResponse[]>('/trips', {
    params: normalizeTripsQuery(query),
  })
  return response.data
}

export async function getTripDetail(tripId: string): Promise<TripResponse> {
  const response = await apiClient.get<TripResponse>(`/trips/${tripId}`)
  return response.data
}

export async function getPublicTrips(query: TripsQuery): Promise<TripResponse[]> {
  const response = await apiClient.get<TripResponse[]>('/trips/public', {
    params: normalizeTripsQuery(query),
  })
  return response.data
}

export async function getPublicTripDetail(tripId: string): Promise<TripResponse> {
  const response = await apiClient.get<TripResponse>(`/trips/public/${tripId}`)
  return response.data
}

export async function createTrip(payload: CreateTripPayload): Promise<TripResponse> {
  const response = await apiClient.post<TripResponse>('/trips', payload)
  return response.data
}

export async function addTripDay(tripId: string, payload: AddTripDayPayload): Promise<void> {
  await apiClient.post(`/trips/${tripId}/days`, payload)
}

export async function updateTripDay(tripId: string, dayId: string, payload: UpdateTripDayPayload): Promise<void> {
  await apiClient.patch(`/trips/${tripId}/days/${dayId}`, payload)
}

export async function removeTripDay(tripId: string, dayId: string): Promise<void> {
  await apiClient.delete(`/trips/${tripId}/days/${dayId}`)
}

export async function addTripItem(tripId: string, dayId: string, payload: AddTripItemPayload): Promise<void> {
  await apiClient.post(`/trips/${tripId}/days/${dayId}/items`, payload)
}

export async function updateTripItem(
  tripId: string,
  dayId: string,
  itemId: string,
  payload: UpdateTripItemPayload,
): Promise<void> {
  await apiClient.patch(`/trips/${tripId}/days/${dayId}/items/${itemId}`, payload)
}

export async function rescheduleTripItem(
  tripId: string,
  dayId: string,
  itemId: string,
  payload: RescheduleTripItemPayload,
): Promise<void> {
  await apiClient.patch(`/trips/${tripId}/days/${dayId}/items/${itemId}/time`, payload)
}

export async function removeTripItem(tripId: string, dayId: string, itemId: string): Promise<void> {
  await apiClient.delete(`/trips/${tripId}/days/${dayId}/items/${itemId}`)
}
