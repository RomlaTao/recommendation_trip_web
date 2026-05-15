import { apiClient } from '@/core/api/axios'
import type {
  AddTripDayInput,
  AddTripItemInput,
  CreateTripInput,
  ItineraryViewResponse,
  Trip,
  TripRouteOverview,
  TripRouteWaypoint,
} from '@/features/trips/types/trips.types'
import { normalizeWallTimeToHhmm } from '@/features/trips/utils/wall-time'

function normalizeRouteOverview(raw: unknown): TripRouteOverview | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const generatedAt = typeof o.generatedAt === 'string' ? o.generatedAt : ''
  const tripVersion = Number(o.tripVersion ?? NaN)
  const wpRaw = o.waypoints
  if (!generatedAt || !Number.isFinite(tripVersion) || !Array.isArray(wpRaw)) return null
  const waypoints: TripRouteWaypoint[] = []
  for (const row of wpRaw) {
    if (!row || typeof row !== 'object') continue
    const w = row as Record<string, unknown>
    waypoints.push({
      tripItemId: String(w.tripItemId ?? ''),
      placeId: String(w.placeId ?? ''),
      dayIndex: Number(w.dayIndex ?? 0),
      sortOrder: Number(w.sortOrder ?? 0),
      name: String(w.name ?? ''),
      lat: Number(w.lat ?? NaN),
      lng: Number(w.lng ?? NaN),
    })
  }
  return { generatedAt, tripVersion, waypoints }
}

function normalizeTrip(raw: unknown): Trip {
  const t = (raw ?? {}) as Record<string, unknown>
  const daysRaw = Array.isArray(t.days) ? t.days : []
  return {
    id: String(t.id ?? ''),
    title: String(t.title ?? 'Untitled Trip'),
    destinationId: typeof t.destinationId === 'string' ? t.destinationId : null,
    startDate: String(t.startDate ?? ''),
    endDate: String(t.endDate ?? ''),
    status: String(t.status ?? 'draft'),
    version: Number(t.version ?? 1),
    routeOverview: normalizeRouteOverview(t.routeOverview),
    days: daysRaw.map((d) => {
      const day = d as Record<string, unknown>
      const itemsRaw = Array.isArray(day.items) ? day.items : []
      return {
        id: String(day.id ?? ''),
        dayIndex: Number(day.dayIndex ?? 1),
        date: String(day.date ?? ''),
        items: itemsRaw.map((i) => {
          const item = i as Record<string, unknown>
          return {
            id: String(item.id ?? ''),
            placeId: String(item.placeId ?? ''),
            type: String(item.type ?? 'restaurant'),
            startTime: normalizeWallTimeToHhmm(item.startTime),
            endTime: normalizeWallTimeToHhmm(item.endTime),
            note: typeof item.note === 'string' ? item.note : null,
            sortOrder: Number(item.sortOrder ?? 1),
            ...(typeof item.startAt === 'string' ? { startAt: item.startAt } : {}),
            ...(typeof item.endAt === 'string' ? { endAt: item.endAt } : {}),
          }
        }),
      }
    }),
  }
}

function normalizeItineraryView(raw: unknown): ItineraryViewResponse {
  const body = (raw ?? {}) as Record<string, unknown>
  const trip = normalizeTrip(body.trip ?? {})
  const eventsRaw = Array.isArray(body.events) ? body.events : []
  const events = eventsRaw.map((e) => {
    const ev = e as Record<string, unknown>
    const row = {
      id: String(ev.id ?? ''),
      dayId: String(ev.dayId ?? ''),
      dayIndex: Number(ev.dayIndex ?? 1),
      date: String(ev.date ?? ''),
      placeId: String(ev.placeId ?? ''),
      type: String(ev.type ?? 'restaurant'),
      startTime: normalizeWallTimeToHhmm(ev.startTime),
      endTime: normalizeWallTimeToHhmm(ev.endTime),
      note: typeof ev.note === 'string' ? ev.note : null,
      sortOrder: Number(ev.sortOrder ?? 1),
      ...(typeof ev.startAt === 'string' ? { startAt: ev.startAt } : {}),
      ...(typeof ev.endAt === 'string' ? { endAt: ev.endAt } : {}),
    }
    return row
  })
  return { trip, events }
}

export const tripsApi = {
  listMine: async (): Promise<Trip[]> => {
    const res = await apiClient.get('/trips')
    const payload = (res.data as { data?: unknown }).data ?? res.data
    const rows = Array.isArray(payload) ? payload : []
    return rows.map(normalizeTrip)
  },

  getById: async (tripId: string): Promise<Trip> => {
    const res = await apiClient.get(`/trips/${tripId}`)
    const payload = (res.data as { data?: unknown }).data ?? res.data
    return normalizeTrip(payload)
  },

  getItineraryView: async (tripId: string): Promise<ItineraryViewResponse> => {
    const res = await apiClient.get(`/trips/${tripId}/itinerary-view`)
    const payload = (res.data as { data?: unknown }).data ?? res.data
    return normalizeItineraryView(payload)
  },

  create: async (input: CreateTripInput): Promise<Trip> => {
    const start = new Date(input.startDate)
    const end = new Date(input.endDate)
    const daysCount = Math.max(
      1,
      Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1,
    )
    const days = Array.from({ length: daysCount }).map((_, idx) => {
      const current = new Date(start)
      current.setDate(start.getDate() + idx)
      return {
        dayIndex: idx + 1,
        date: current.toISOString().slice(0, 10),
        items: [],
      }
    })

    const res = await apiClient.post('/trips', {
      title: input.title,
      destinationId: input.destinationId,
      startDate: input.startDate,
      endDate: input.endDate,
      days,
    })
    const payload = (res.data as { data?: unknown }).data ?? res.data
    return normalizeTrip(payload)
  },

  addDay: async (tripId: string, dto: AddTripDayInput): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/days`, dto)
  },

  deleteDay: async (tripId: string, dayId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/days/${dayId}`)
  },

  addItem: async (tripId: string, dayId: string, dto: AddTripItemInput): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/days/${dayId}/items`, dto)
  },

  deleteItem: async (tripId: string, dayId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/days/${dayId}/items/${itemId}`)
  },

  deleteTrip: async (tripId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}`)
  },

  updateItem: async (
    tripId: string,
    dayId: string,
    itemId: string,
    dto: { sortOrder?: number; note?: string; type?: string; placeId?: string },
  ): Promise<void> => {
    await apiClient.patch(`/trips/${tripId}/days/${dayId}/items/${itemId}`, dto)
  },

  rebuildRouteOverview: async (tripId: string): Promise<TripRouteOverview> => {
    const res = await apiClient.post(`/trips/${tripId}/route-overview/rebuild`)
    const payload = (res.data as { data?: unknown }).data ?? res.data
    const normalized = normalizeRouteOverview(payload)
    if (!normalized) {
      throw new Error('Invalid route overview response')
    }
    return normalized
  },

  rescheduleItem: async (
    tripId: string,
    dayId: string,
    itemId: string,
    dto: { startTime: string; endTime: string },
  ): Promise<void> => {
    await apiClient.patch(`/trips/${tripId}/days/${dayId}/items/${itemId}/time`, dto)
  },
}
