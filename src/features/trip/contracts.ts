export type TripStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'STARTED' | 'COMPLETED'

export type TripItemResponse = {
  id: string
  placeId: string
  type: string
  startTime: string
  endTime: string
  note: string | null
  sortOrder: number
}

export type TripDayResponse = {
  id: string
  dayIndex: number
  date: string
  items: TripItemResponse[]
}

export type TripResponse = {
  id: string
  title: string
  startDate: string
  endDate: string
  status: TripStatus
  isPublic: boolean
  version: number
  days: TripDayResponse[]
}

export type TripsQuery = {
  page?: number
  limit?: number
}

export type CreateTripItemPayload = {
  placeId: string
  type: string
  startTime: string
  endTime: string
  note?: string
  sortOrder?: number
}

export type CreateTripDayPayload = {
  dayIndex: number
  date: string
  items: CreateTripItemPayload[]
}

export type CreateTripPayload = {
  title: string
  startDate: string
  endDate: string
  days: CreateTripDayPayload[]
  sourceSnapshotId?: string
}

export type AddTripDayPayload = {
  dayIndex: number
  date: string
}

export type UpdateTripDayPayload = {
  dayIndex?: number
  date?: string
}

export type AddTripItemPayload = {
  placeId: string
  type: string
  startTime: string
  endTime: string
  note?: string
  sortOrder?: number
}

export type UpdateTripItemPayload = {
  placeId?: string
  type?: string
  note?: string
  sortOrder?: number
}

export type RescheduleTripItemPayload = {
  startTime: string
  endTime: string
}

export type TripDraftItem = TripItemResponse

export type TripDraftDay = {
  id: string
  dayIndex: number
  date: string
  items: TripDraftItem[]
}

export type TripDraft = {
  tripId: string
  title: string
  startDate: string
  endDate: string
  version: number
  days: TripDraftDay[]
}

export type DraftOperation =
  | { type: 'updateDay'; tripId: string; dayId: string; payload: UpdateTripDayPayload }
  | { type: 'removeItem'; tripId: string; dayId: string; itemId: string }
  | { type: 'addItem'; tripId: string; dayId: string; payload: AddTripItemPayload }
  | { type: 'updateItem'; tripId: string; dayId: string; itemId: string; payload: UpdateTripItemPayload }
