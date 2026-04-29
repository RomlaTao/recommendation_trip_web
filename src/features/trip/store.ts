import { create } from 'zustand'

import {
  mapTripResponseToDraft,
  normalizeItemSortOrder,
  sortDays,
  toAddItemPayload,
} from '@/features/trip/mappers'
import type {
  DraftOperation,
  TripDraft,
  TripDraftDay,
  TripResponse,
  UpdateTripDayPayload,
} from '@/features/trip/contracts'

type DraggingItem = {
  itemId: string
  fromDayId: string
}

type TripDraftStore = {
  draft: TripDraft | null
  isDirty: boolean
  operations: DraftOperation[]
  draggingItem: DraggingItem | null
  initializeDraft: (trip: TripResponse) => void
  reorderDays: (orderedDayIds: string[]) => void
  startDragItem: (itemId: string, fromDayId: string) => void
  dropItemToDay: (targetDayId: string, targetIndex: number) => void
  clearDragging: () => void
  consumeOperations: () => DraftOperation[]
  markPersistSuccess: () => void
  resetToServerTrip: (trip: TripResponse) => void
}

function updateDayOrder(days: TripDraftDay[]): { days: TripDraftDay[]; operations: DraftOperation[] } {
  const ordered = days.map((day, index) => ({
    ...day,
    dayIndex: index + 1,
  }))

  const operations = ordered.map((day) => ({
    type: 'updateDay',
    tripId: '',
    dayId: day.id,
    payload: {
      dayIndex: day.dayIndex,
    } satisfies UpdateTripDayPayload,
  })) as DraftOperation[]

  return { days: ordered, operations }
}

export const useTripDraftStore = create<TripDraftStore>((set, get) => ({
  draft: null,
  isDirty: false,
  operations: [],
  draggingItem: null,
  initializeDraft: (trip) => {
    const current = get().draft
    if (current?.tripId === trip.id && !get().isDirty) {
      set({ draft: mapTripResponseToDraft(trip) })
      return
    }

    if (!current || current.tripId !== trip.id || !get().isDirty) {
      set({
        draft: mapTripResponseToDraft(trip),
        isDirty: false,
        operations: [],
      })
    }
  },
  reorderDays: (orderedDayIds) => {
    const current = get().draft
    if (!current) {
      return
    }

    const nextDays = orderedDayIds
      .map((dayId) => current.days.find((day) => day.id === dayId))
      .filter((day): day is TripDraftDay => Boolean(day))

    if (nextDays.length !== current.days.length) {
      return
    }

    const { days, operations } = updateDayOrder(nextDays)
    const patchedOperations = operations.map((operation) => ({
      ...operation,
      tripId: current.tripId,
    })) as DraftOperation[]

    set({
      draft: { ...current, days },
      isDirty: true,
      operations: [...get().operations, ...patchedOperations],
    })
  },
  startDragItem: (itemId, fromDayId) => {
    set({
      draggingItem: {
        itemId,
        fromDayId,
      },
    })
  },
  dropItemToDay: (targetDayId, targetIndex) => {
    const { draft, draggingItem } = get()
    if (!draft || !draggingItem) {
      return
    }

    const sourceDay = draft.days.find((day) => day.id === draggingItem.fromDayId)
    const destinationDay = draft.days.find((day) => day.id === targetDayId)
    if (!sourceDay || !destinationDay) {
      set({ draggingItem: null })
      return
    }

    const movedItem = sourceDay.items.find((item) => item.id === draggingItem.itemId)
    if (!movedItem) {
      set({ draggingItem: null })
      return
    }

    const sourceWithoutItem = sourceDay.items.filter((item) => item.id !== movedItem.id)
    const nextDestinationItems = [...destinationDay.items]
    const safeTargetIndex = Math.max(0, Math.min(targetIndex, nextDestinationItems.length))
    nextDestinationItems.splice(safeTargetIndex, 0, movedItem)

    const normalizedSourceItems = normalizeItemSortOrder(sourceWithoutItem)
    const normalizedDestinationItems = normalizeItemSortOrder(nextDestinationItems)

    const nextDays = draft.days.map((day) => {
      if (day.id === sourceDay.id) {
        return { ...day, items: normalizedSourceItems }
      }
      if (day.id === destinationDay.id) {
        return { ...day, items: normalizedDestinationItems }
      }
      return day
    })

    const operations: DraftOperation[] = []
    if (sourceDay.id !== destinationDay.id) {
      operations.push({
        type: 'removeItem',
        tripId: draft.tripId,
        dayId: sourceDay.id,
        itemId: movedItem.id,
      })
      operations.push({
        type: 'addItem',
        tripId: draft.tripId,
        dayId: destinationDay.id,
        payload: toAddItemPayload({
          ...movedItem,
          sortOrder: safeTargetIndex + 1,
        }),
      })
    }

    normalizedDestinationItems.forEach((item) => {
      operations.push({
        type: 'updateItem',
        tripId: draft.tripId,
        dayId: destinationDay.id,
        itemId: item.id,
        payload: {
          sortOrder: item.sortOrder,
        },
      })
    })

    if (sourceDay.id !== destinationDay.id) {
      normalizedSourceItems.forEach((item) => {
        operations.push({
          type: 'updateItem',
          tripId: draft.tripId,
          dayId: sourceDay.id,
          itemId: item.id,
          payload: {
            sortOrder: item.sortOrder,
          },
        })
      })
    }

    set({
      draft: {
        ...draft,
        days: sortDays(nextDays),
      },
      isDirty: true,
      operations: [...get().operations, ...operations],
      draggingItem: null,
    })
  },
  clearDragging: () => {
    set({ draggingItem: null })
  },
  consumeOperations: () => {
    const operations = get().operations
    set({ operations: [] })
    return operations
  },
  markPersistSuccess: () => {
    set({ isDirty: false })
  },
  resetToServerTrip: (trip) => {
    set({
      draft: mapTripResponseToDraft(trip),
      isDirty: false,
      operations: [],
      draggingItem: null,
    })
  },
}))
