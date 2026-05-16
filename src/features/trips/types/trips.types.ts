export const TRIP_ITEM_TYPES = [
  'restaurant',
  'cafe',
  'hotel',
  'tourist_attraction',
  'bar',
  'park',
] as const

export type TripItemType = (typeof TRIP_ITEM_TYPES)[number]

export interface TripItem {
  id: string
  placeId: string
  type: TripItemType | string
  startTime: string
  endTime: string
  /** ISO 8601 — canonical anchor for calendar / dual-view (from backend). */
  startAt?: string
  endAt?: string
  note?: string | null
  sortOrder: number
}

export interface TripDay {
  id: string
  dayIndex: number
  date: string
  items: TripItem[]
}

/** Frozen itinerary geo returned from backend (`routeOverview` on trip). */
export interface TripRouteWaypoint {
  tripItemId: string
  placeId: string
  dayIndex: number
  sortOrder: number
  name: string
  lat: number
  lng: number
}

export interface TripRouteOverview {
  generatedAt: string
  tripVersion: number
  waypoints: TripRouteWaypoint[]
}

export interface Trip {
  id: string
  title: string
  destinationId: string | null
  startDate: string
  endDate: string
  status: string
  version: number
  days: TripDay[]
  /** Frozen geo snapshot — `null` if never rebuilt */
  routeOverview: TripRouteOverview | null
}

/** Flat item row for calendar / grid views (`GET /trips/:id/itinerary-view`). */
export interface TripCalendarEvent extends TripItem {
  dayId: string
  dayIndex: number
  date: string
}

export interface ItineraryViewResponse {
  trip: Trip
  events: TripCalendarEvent[]
}

export interface CreateTripInput {
  title: string
  destinationId: string
  startDate: string
  endDate: string
}

export interface AddTripDayInput {
  dayIndex: number
  date: string
}

export interface AddTripItemInput {
  placeId: string
  type: TripItemType
  startTime: string
  endTime: string
  note?: string
  sortOrder?: number
}
