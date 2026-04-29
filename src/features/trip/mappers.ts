import type {
  AddTripItemPayload,
  TripDraft,
  TripDraftDay,
  TripDraftItem,
  TripResponse,
} from '@/features/trip/contracts'

export function mapTripResponseToDraft(trip: TripResponse): TripDraft {
  return {
    tripId: trip.id,
    title: trip.title,
    startDate: trip.startDate,
    endDate: trip.endDate,
    version: trip.version,
    days: trip.days.map((day) => ({
      id: day.id,
      dayIndex: day.dayIndex,
      date: day.date,
      items: day.items.map((item) => ({ ...item })),
    })),
  }
}

export function sortDays(days: TripDraftDay[]): TripDraftDay[] {
  return [...days].sort((a, b) => a.dayIndex - b.dayIndex)
}

export function normalizeItemSortOrder(items: TripDraftItem[]): TripDraftItem[] {
  return items.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }))
}

export function toAddItemPayload(item: TripDraftItem): AddTripItemPayload {
  return {
    placeId: item.placeId,
    type: item.type,
    startTime: item.startTime,
    endTime: item.endTime,
    note: item.note ?? undefined,
    sortOrder: item.sortOrder,
  }
}
