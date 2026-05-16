import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { Alert } from '@/components/ui/Alert'
import { useAddTripDay, useAddTripItem, useDeleteTripDay, useDeleteTripItem, useTripDetail } from '@/features/trips/hooks/useTrips'
import { TRIP_ITEM_TYPES, type TripDay } from '@/features/trips/types/trips.types'
import { TripRouteOverviewMap } from '@/features/trips/components/TripRouteOverviewMap'
import { useRouteOverviewMetrics } from '@/features/trips/hooks/use-mapbox-driving-route'
import { TripFullCalendar } from '@/features/trips/components/TripFullCalendar'
import { env } from '@/config/env'
import { placesApi } from '@/features/places/api/places.api'
import { tripsApi } from '@/features/trips/api/trips.api'
import { formatTripApiUserMessage } from '@/features/trips/utils/trip-api-error-message'
import { normalizeWallTimeToHhmm } from '@/features/trips/utils/wall-time'
import { TripDiscoverSidebar } from '@/features/trips/components/TripDiscoverSidebar'
import { destinationCenterFromSlug } from '@/features/trips/utils/destination-centers'
import {
  buildAnchorPlacePoint,
  resolveRecommendAnchorPlaceId,
} from '@/features/trips/utils/resolve-trip-day-anchor'

interface DraftTripItem {
  id: string
  placeId: string
  type: string
  startTime: string
  endTime: string
  startAt?: string
  endAt?: string
  note?: string | null
  sortOrder: number
}

interface DraftTripDay {
  id: string
  dayIndex: number
  date: string
  items: DraftTripItem[]
}

function itinerarySaveErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { message?: unknown } } }).response?.data
    const msg = data?.message
    if (typeof msg === 'string' && msg.trim()) return formatTripApiUserMessage(msg)
    if (Array.isArray(msg) && typeof msg[0] === 'string') return formatTripApiUserMessage(msg[0])
  }
  if (err instanceof Error && err.message) {
    const m = err.message.trim()
    if (m === 'trip_save_no_temp_slot' || m.includes('trip_save_no_temp_slot')) {
      return formatTripApiUserMessage('trip_save_no_temp_slot')
    }
    if (err.message.includes('trip_item_time_overlap')) {
      return formatTripApiUserMessage('trip_item_time_overlap')
    }
    return err.message
  }
  return 'Could not save itinerary. Check network or overlapping times on the server.'
}

function tripCalendarMonthLabel(days: DraftTripDay[]): string {
  const sorted = [...days].sort((a, b) => a.dayIndex - b.dayIndex)
  const first = sorted[0]?.date
  if (!first) return 'Trip calendar'
  return new Date(`${first}T12:00:00`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

function routeOverviewTabLabel(days: TripDay[], dayIndex: number): string {
  const d = days.find((x) => x.dayIndex === dayIndex)
  return d ? `Day ${dayIndex} · ${d.date}` : `Day ${dayIndex}`
}

export default function TripDetailRoute() {
  const { id } = useParams()
  const trip = useTripDetail(id)
  const addDay = useAddTripDay(id ?? '')
  const deleteDay = useDeleteTripDay(id ?? '')
  const addItem = useAddTripItem(id ?? '')
  const deleteItem = useDeleteTripItem(id ?? '')

  const [selectedDayId, setSelectedDayId] = useState('')
  const [newDayDate, setNewDayDate] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  /** Discover anchor: prefer the last place successfully added while editing this trip. */
  const [discoverLastAddedPlaceId, setDiscoverLastAddedPlaceId] = useState<string | null>(null)
  const [draftDays, setDraftDays] = useState<DraftTripDay[]>([])
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [routeOverviewSelectedDayIndex, setRouteOverviewSelectedDayIndex] = useState<number | null>(
    null,
  )
  const queryClient = useQueryClient()

  const orderedDays = useMemo(
    () => [...(trip.data?.days ?? [])].sort((a, b) => a.dayIndex - b.dayIndex),
    [trip.data?.days],
  )
  const totalItems = draftDays.reduce((acc, day) => acc + day.items.length, 0)

  const dayOptions = draftDays.map((d) => ({ id: d.id, label: `Day ${d.dayIndex} (${d.date})` }))
  const effectiveDayIdForAnchor = selectedDayId || draftDays[0]?.id || ''
  const recommendAnchor = useMemo(
    () => resolveRecommendAnchorPlaceId(draftDays, effectiveDayIdForAnchor),
    [draftDays, effectiveDayIdForAnchor],
  )

  const dayItineraryPlaceIds = useMemo(() => {
    const day = draftDays.find((d) => d.id === effectiveDayIdForAnchor)
    if (!day) return new Set<string>()
    return new Set(day.items.map((i) => i.placeId).filter(Boolean))
  }, [draftDays, effectiveDayIdForAnchor])

  const firstDayPlaceId = useMemo(() => {
    const day = draftDays.find((d) => d.id === effectiveDayIdForAnchor)
    if (!day) return null
    const items = [...day.items].sort((a, b) => a.sortOrder - b.sortOrder)
    return items[0]?.placeId ?? null
  }, [draftDays, effectiveDayIdForAnchor])

  const effectiveRecommendAnchorPlaceId = useMemo(() => {
    if (
      discoverLastAddedPlaceId &&
      dayItineraryPlaceIds.has(discoverLastAddedPlaceId)
    ) {
      return discoverLastAddedPlaceId
    }
    return recommendAnchor.placeId ?? firstDayPlaceId
  }, [
    discoverLastAddedPlaceId,
    dayItineraryPlaceIds,
    recommendAnchor.placeId,
    firstDayPlaceId,
  ])

  const placeIds = useMemo(() => {
    const ids = new Set(
      draftDays.flatMap((day) => day.items.map((item) => item.placeId)).filter(Boolean),
    )
    if (effectiveRecommendAnchorPlaceId) ids.add(effectiveRecommendAnchorPlaceId)
    return Array.from(ids)
  }, [draftDays, effectiveRecommendAnchorPlaceId])
  const placeQueries = useQueries({
    queries: placeIds.map((pid) => ({
      queryKey: ['places', 'detail', pid],
      queryFn: () => placesApi.getById(pid),
      enabled: Boolean(pid),
    })),
  })
  const destinationsQuery = useQuery({
    queryKey: ['places', 'destinations'],
    queryFn: () => placesApi.destinations(),
    staleTime: 5 * 60 * 1000,
  })
  const placeMetaMap = useMemo(() => {
    const map = new Map<string, { name: string; category: string; lat: number; lng: number }>()
    placeQueries.forEach((q) => {
      if (q.data) {
        map.set(q.data.id, {
          name: q.data.name,
          category: q.data.categoryName ?? q.data.categoryId ?? 'Unknown category',
          lat: q.data.lat,
          lng: q.data.lng,
        })
      }
    })
    return map
  }, [placeQueries])

  const placeCoordsMap = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number }>()
    placeMetaMap.forEach((meta, id) => {
      map.set(id, { lat: meta.lat, lng: meta.lng })
    })
    return map
  }, [placeMetaMap])

  const anchorPlacePayload = useMemo(
    () => buildAnchorPlacePoint(effectiveRecommendAnchorPlaceId, placeCoordsMap),
    [effectiveRecommendAnchorPlaceId, placeCoordsMap],
  )

  const dayFallbackLatLng = useMemo(() => {
    const coords: { lat: number; lng: number }[] = []
    const day = draftDays.find((d) => d.id === effectiveDayIdForAnchor)
    day?.items.forEach((i) => {
      const c = placeCoordsMap.get(i.placeId)
      if (c && Number.isFinite(c.lat) && Number.isFinite(c.lng)) coords.push(c)
    })
    if (!coords.length) {
      const tripDestination = (destinationsQuery.data ?? []).find(
        (d) => d.id === (trip.data?.destinationId ?? null),
      )
      const byDestination = destinationCenterFromSlug(tripDestination?.slug)
      if (byDestination) return byDestination
      return { lat: 10.762622, lng: 106.660172 }
    }
    const lat = coords.reduce((s, p) => s + p.lat, 0) / coords.length
    const lng = coords.reduce((s, p) => s + p.lng, 0) / coords.length
    return { lat, lng }
  }, [draftDays, effectiveDayIdForAnchor, destinationsQuery.data, placeCoordsMap, trip.data?.destinationId])

  const dayHasItemStops = useMemo(() => {
    const day = draftDays.find((d) => d.id === effectiveDayIdForAnchor)
    return (day?.items.length ?? 0) > 0
  }, [draftDays, effectiveDayIdForAnchor])

  const discoverAnchorSummary = useMemo(() => {
    if (totalItems === 0) {
      return 'Cold start — rerank still uses popularity & distance vs fallback coordinates until you add stops.'
    }
    if (!draftDays.length) return 'Add trip days and stops.'
    const pid = effectiveRecommendAnchorPlaceId
    if (!pid) return 'Using average position of your stops.'
    const name = placeMetaMap.get(pid)?.name ?? `Place ${pid.slice(0, 8)}…`
    if (
      discoverLastAddedPlaceId &&
      dayItineraryPlaceIds.has(discoverLastAddedPlaceId) &&
      pid === discoverLastAddedPlaceId
    ) {
      return `${name} — most recently added stop`
    }
    if (recommendAnchor.placeId === pid && recommendAnchor.source === 'bottom_item') {
      return `${name} — last stop on selected day`
    }
    if (recommendAnchor.placeId === pid && recommendAnchor.source === 'hotel_fallback') {
      return `${name} — hotel fallback (empty day)`
    }
    return `${name} — trip reference`
  }, [
    totalItems,
    draftDays.length,
    effectiveRecommendAnchorPlaceId,
    placeMetaMap,
    discoverLastAddedPlaceId,
    dayItineraryPlaceIds,
    recommendAnchor.placeId,
    recommendAnchor.source,
  ])

  const targetDayId = selectedDayId || draftDays[0]?.id || ''

  useEffect(() => {
    if (totalItems === 0) setDiscoverLastAddedPlaceId(null)
  }, [totalItems])

  useEffect(() => {
    if (!trip.data) return
    const nextDraft = [...trip.data.days]
      .sort((a, b) => a.dayIndex - b.dayIndex)
      .map((day) => ({
        id: day.id,
        dayIndex: day.dayIndex,
        date: day.date,
        items: [...day.items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item, idx) => ({ ...item, sortOrder: idx + 1 })),
      }))
    setDraftDays(nextDraft)
  }, [trip.data])

  const originalItemMap = useMemo(() => {
    const map = new Map<string, { dayId: string; sortOrder: number; startTime: string; endTime: string }>()
    orderedDays.forEach((day) => {
      day.items.forEach((item) => {
        map.set(item.id, {
          dayId: day.id,
          sortOrder: item.sortOrder,
          startTime: item.startTime,
          endTime: item.endTime,
        })
      })
    })
    return map
  }, [orderedDays])

  /** True interval overlap only — reordering cards may put later clock times first without overlapping intervals. */
  const overlapItemIds = useMemo(() => {
    const ids = new Set<string>()
    draftDays.forEach((day) => {
      const items = [...day.items]
      for (let i = 0; i < items.length; i += 1) {
        const a = items[i]
        const aStart = hhmmToMinutes(a.startTime)
        const aEnd = hhmmToMinutes(a.endTime)
        if (aStart >= aEnd) continue
        for (let j = i + 1; j < items.length; j += 1) {
          const b = items[j]
          const bStart = hhmmToMinutes(b.startTime)
          const bEnd = hhmmToMinutes(b.endTime)
          if (bStart >= bEnd) continue
          if (aStart < bEnd && bStart < aEnd) {
            ids.add(a.id)
            ids.add(b.id)
          }
        }
      }
    })
    return ids
  }, [draftDays])

  const hasOverlap = overlapItemIds.size > 0
  const invalidRangeItemIds = useMemo(() => {
    const ids = new Set<string>()
    draftDays.forEach((day) => {
      day.items.forEach((item) => {
        if (hhmmToMinutes(item.startTime) >= hhmmToMinutes(item.endTime)) {
          ids.add(item.id)
        }
      })
    })
    return ids
  }, [draftDays])
  const hasInvalidTimeRange = invalidRangeItemIds.size > 0
  const hasTimeIssue = hasOverlap || hasInvalidTimeRange

  const hasUnsavedChanges = useMemo(() => {
    for (const day of draftDays) {
      for (const item of day.items) {
        const original = originalItemMap.get(item.id)
        if (!original) return true
        if (
          original.dayId !== day.id ||
          original.sortOrder !== item.sortOrder ||
          normalizeWallTimeToHhmm(original.startTime) !== normalizeWallTimeToHhmm(item.startTime) ||
          normalizeWallTimeToHhmm(original.endTime) !== normalizeWallTimeToHhmm(item.endTime)
        ) {
          return true
        }
      }
    }
    return false
  }, [draftDays, originalItemMap])

  const routeOverviewWaypoints = useMemo(
    () => trip.data?.routeOverview?.waypoints ?? [],
    [trip.data?.routeOverview],
  )

  const routeOverviewDayIndices = useMemo(() => {
    const idx = new Set(routeOverviewWaypoints.map((w) => w.dayIndex))
    return [...idx].sort((a, b) => a - b)
  }, [routeOverviewWaypoints])

  useEffect(() => {
    if (routeOverviewDayIndices.length === 0) {
      setRouteOverviewSelectedDayIndex(null)
      return
    }
    setRouteOverviewSelectedDayIndex((prev) =>
      prev !== null && routeOverviewDayIndices.includes(prev)
        ? prev
        : routeOverviewDayIndices[0],
    )
  }, [routeOverviewDayIndices])

  const routeOverviewWaypointsForDay = useMemo(() => {
    if (routeOverviewSelectedDayIndex === null) return []
    return routeOverviewWaypoints
      .filter((w) => w.dayIndex === routeOverviewSelectedDayIndex)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [routeOverviewWaypoints, routeOverviewSelectedDayIndex])

  const rebuildRouteOverview = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('Trip id missing')
      return tripsApi.rebuildRouteOverview(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trips', 'detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['trips', 'itinerary-view', id] })
    },
  })

  const routeMetrics = useRouteOverviewMetrics(
    routeOverviewWaypointsForDay,
    env.MAPBOX_ACCESS_TOKEN,
  )

  const saveChanges = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Trip id missing')

      for (const day of draftDays) {
        for (const item of day.items) {
          const original = originalItemMap.get(item.id)
          if (!original) continue
          if (original.dayId !== day.id) {
            await tripsApi.addItem(id, day.id, {
              placeId: item.placeId,
              type: item.type as (typeof TRIP_ITEM_TYPES)[number],
              startTime: normalizeWallTimeToHhmm(item.startTime),
              endTime: normalizeWallTimeToHhmm(item.endTime),
              note: item.note ?? undefined,
              sortOrder: item.sortOrder,
            })
            await tripsApi.deleteItem(id, original.dayId, item.id)
          }
        }
      }

      type TimeChange = { itemId: string; start: string; end: string }
      const timeChangesByDay = new Map<string, TimeChange[]>()
      for (const day of draftDays) {
        for (const item of day.items) {
          const original = originalItemMap.get(item.id)
          if (!original || original.dayId !== day.id) continue
          const st = normalizeWallTimeToHhmm(item.startTime)
          const et = normalizeWallTimeToHhmm(item.endTime)
          const ost = normalizeWallTimeToHhmm(original.startTime)
          const oet = normalizeWallTimeToHhmm(original.endTime)
          if (ost === st && oet === et) continue
          const list = timeChangesByDay.get(day.id) ?? []
          list.push({ itemId: item.id, start: st, end: et })
          timeChangesByDay.set(day.id, list)
        }
      }

      for (const [dayId, changes] of timeChangesByDay) {
        const day = draftDays.find((d) => d.id === dayId)
        if (!day) continue
        const changeIds = new Set(changes.map((c) => c.itemId))
        const blocked: IntervalMin[] = []
        for (const item of day.items) {
          if (changeIds.has(item.id)) continue
          const lo = hhmmToMinutes(normalizeWallTimeToHhmm(item.startTime))
          const hi = hhmmToMinutes(normalizeWallTimeToHhmm(item.endTime))
          if (lo < hi) blocked.push({ lo, hi })
        }

        if (changes.length <= 1) {
          for (const c of changes) {
            await tripsApi.rescheduleItem(id, dayId, c.itemId, {
              startTime: c.start,
              endTime: c.end,
            })
          }
          continue
        }

        const temps = findDisjointTempIntervals(changes.length, blocked)
        for (let i = 0; i < changes.length; i++) {
          const c = changes[i]
          const t = temps[i]
          await tripsApi.rescheduleItem(id, dayId, c.itemId, {
            startTime: minutesToHhmm(t.lo),
            endTime: minutesToHhmm(t.hi),
          })
        }
        const sorted = [...changes].sort(
          (a, b) => hhmmToMinutes(a.start) - hhmmToMinutes(b.start),
        )
        for (const c of sorted) {
          await tripsApi.rescheduleItem(id, dayId, c.itemId, {
            startTime: c.start,
            endTime: c.end,
          })
        }
      }

      for (const day of draftDays) {
        for (const item of day.items) {
          const original = originalItemMap.get(item.id)
          if (!original || original.dayId !== day.id) continue
          if (original.sortOrder !== item.sortOrder) {
            await tripsApi.updateItem(id, day.id, item.id, { sortOrder: item.sortOrder })
          }
        }
      }
    },
    onSuccess: async () => {
      if (id) {
        try {
          await tripsApi.rebuildRouteOverview(id)
        } catch {
          /* Snapshot optional if itinerary empty or places unresolved — user can refresh */
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['trips', 'detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['trips', 'itinerary-view', id] })
    },
  })

  return (
    <PublicSiteLayout>
      <main className={`pt-24 bg-surface min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:pr-[430px]' : ''}`}>
        {trip.isError && (
          <section className="max-w-7xl mx-auto px-10 py-8">
            <Alert variant="error" message="Failed to load trip detail." />
          </section>
        )}

        {trip.isLoading && (
          <section className="max-w-7xl mx-auto px-10 py-20 text-center text-on-surface-variant">
            Loading trip details...
          </section>
        )}

        {trip.data && (
          <>
            <header className="relative h-[220px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80"
                alt={trip.data.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10 flex flex-col justify-end px-margin-edge pb-6">
                <Link
                  to="/trips"
                  className="text-on-media/80 hover:text-on-media text-[11px] uppercase tracking-[0.16em] mb-2 inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to My Trips
                </Link>
                <h1 className="font-headline-lg text-on-media uppercase tracking-tight">{trip.data.title}</h1>
                <p className="font-headline-md text-on-media/90 uppercase">{trip.data.startDate} - {trip.data.endDate}</p>
              </div>
            </header>

            <section className="max-w-container-max mx-auto px-margin-edge py-stack-md grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              <div className={`${isSidebarOpen ? 'lg:col-span-12' : 'lg:col-span-7'} transition-all duration-300`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="font-headline-lg uppercase text-primary">Itinerary</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen((v) => !v)}
                      className="px-5 py-2.5 border border-outline text-primary font-label-caps text-label-caps uppercase tracking-[0.12em] hover:bg-surface-variant"
                    >
                      + Add Place
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDayDate) return
                        addDay.mutate({
                          date: newDayDate,
                          dayIndex: (draftDays.at(-1)?.dayIndex ?? 0) + 1,
                        })
                        setNewDayDate('')
                      }}
                      className="px-5 py-2.5 bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-[0.12em] hover:bg-primary-strong"
                    >
                      Add Day
                    </button>
                  </div>
                </div>

                {/* TripDetails_calendar.html — month chip + LIST / CALENDAR segmented control */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-lg text-primary font-semibold"
                  >
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    <span className="text-xs uppercase tracking-wider">
                      {tripCalendarMonthLabel(draftDays)}
                    </span>
                  </button>
                  <div className="flex bg-surface-container-high p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-1.5 rounded flex items-center gap-2 transition-colors ${
                        viewMode === 'list'
                          ? 'bg-surface-container-lowest shadow-sm text-primary'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                      <span className="text-xs font-bold">LIST</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('calendar')}
                      className={`px-4 py-1.5 rounded flex items-center gap-2 transition-colors ${
                        viewMode === 'calendar'
                          ? 'bg-surface-container-lowest shadow-sm text-primary'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={
                          viewMode === 'calendar'
                            ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                            : undefined
                        }
                      >
                        calendar_view_day
                      </span>
                      <span className="text-xs font-bold">CALENDAR</span>
                    </button>
                  </div>
                </div>

                {viewMode === 'list' && (
                  <>
                    <div className="mb-6 flex justify-end">
                      <input
                        type="date"
                        value={newDayDate}
                        onChange={(e) => setNewDayDate(e.target.value)}
                        className="w-full max-w-[240px] border border-outline-variant px-3 py-2 bg-surface-container-lowest text-sm"
                      />
                    </div>

                    <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-outline-variant">
                      {draftDays.map((day) => (
                        <TripDayBlock
                          key={day.id}
                          day={day}
                          placeMetaMap={placeMetaMap}
                          overlapItemIds={overlapItemIds}
                          invalidRangeItemIds={invalidRangeItemIds}
                          draggingItemId={draggingItemId}
                          onItemTimeChange={(itemId, patch) => {
                            setDraftDays((prev) =>
                              prev.map((d) =>
                                d.id !== day.id
                                  ? d
                                  : {
                                      ...d,
                                      items: d.items.map((it) =>
                                        it.id === itemId ? { ...it, ...patch } : it,
                                      ),
                                    },
                              ),
                            )
                          }}
                          onDragStart={(itemId) => setDraggingItemId(itemId)}
                          onDropOnItem={(targetItemId, targetDayId) => {
                            setDraftDays((prev) =>
                              moveItemAcrossDays(prev, draggingItemId, targetDayId, targetItemId),
                            )
                            setDraggingItemId(null)
                          }}
                          onDropOnDay={(targetDayId) => {
                            setDraftDays((prev) =>
                              moveItemAcrossDays(prev, draggingItemId, targetDayId),
                            )
                            setDraggingItemId(null)
                          }}
                          onDeleteDay={() => deleteDay.mutate(day.id)}
                          onDeleteItem={(itemId) => deleteItem.mutate({ dayId: day.id, itemId })}
                        />
                      ))}
                    </div>
                  </>
                )}

                {viewMode === 'calendar' && (
                  <TripFullCalendar
                    days={draftDays}
                    placeMetaMap={placeMetaMap}
                    overlapItemIds={overlapItemIds}
                    invalidRangeItemIds={invalidRangeItemIds}
                    onDraftChange={(updater) =>
                      setDraftDays((prev) => updater(prev) as DraftTripDay[])
                    }
                  />
                )}
              </div>

              {!isSidebarOpen && (
              <div className="lg:col-span-5">
                <div className="sticky top-[110px] space-y-4">
                  <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
                    <div className="p-4 border-b border-outline-variant flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-label-caps text-label-caps uppercase tracking-[0.12em]">Route Overview</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {routeOverviewWaypointsForDay.length >= 2 && (
                          <p className="text-[11px] text-on-surface-variant uppercase tracking-[0.12em]">
                            {routeMetrics.isLoading
                              ? 'Calculating driving route…'
                              : `~${routeMetrics.distanceKm.toFixed(1)} km this day${
                                  routeMetrics.isDrivingRoute
                                    ? routeMetrics.durationMinutes > 0
                                      ? ` · ~${routeMetrics.durationMinutes} min drive`
                                      : ' (driving)'
                                    : ' (approx.)'
                                }`}
                          </p>
                        )}
                        <button
                          type="button"
                          disabled={!totalItems || rebuildRouteOverview.isPending}
                          onClick={() => rebuildRouteOverview.mutate()}
                          className="text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-40"
                        >
                          Refresh snapshot
                        </button>
                      </div>
                    </div>
                    {!env.MAPBOX_ACCESS_TOKEN.trim() ? (
                      <div className="h-[320px] bg-surface-container-low flex flex-col items-center justify-center px-6 text-center gap-2">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/60">token</span>
                        <p className="text-sm text-on-surface-variant max-w-xs">
                          Set <code className="text-xs bg-surface-container-highest px-1 rounded">VITE_MAPBOX_ACCESS_TOKEN</code> in{' '}
                          <code className="text-xs bg-surface-container-highest px-1 rounded">.env</code> to show the map.
                        </p>
                      </div>
                    ) : routeOverviewWaypoints.length === 0 ? (
                      <div className="h-[320px] bg-surface-container-low flex flex-col items-center justify-center px-6 text-center gap-2">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/60">route</span>
                        <p className="text-sm text-on-surface-variant max-w-xs">
                          Save itinerary or tap “Refresh snapshot” to freeze stops from places for this trip map.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-1 overflow-x-auto px-3 pt-3 pb-2 border-b border-outline-variant/60">
                          {routeOverviewDayIndices.map((dayIdx) => (
                            <button
                              key={dayIdx}
                              type="button"
                              onClick={() => setRouteOverviewSelectedDayIndex(dayIdx)}
                              className={`shrink-0 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] rounded-md border transition-colors whitespace-nowrap ${
                                routeOverviewSelectedDayIndex === dayIdx
                                  ? 'bg-primary text-on-primary border-primary'
                                  : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                              }`}
                            >
                              {routeOverviewTabLabel(orderedDays, dayIdx)}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-4 px-4 py-2 flex-wrap items-center text-[10px] uppercase tracking-[0.12em] text-on-surface-variant border-b border-outline-variant/40">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block size-2.5 rounded-full bg-green-700" aria-hidden />
                            Start
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block size-2.5 rounded-full bg-slate-600" aria-hidden />
                            Via
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block size-2.5 rounded-full bg-red-700" aria-hidden />
                            End
                          </span>
                        </div>
                        {routeOverviewWaypointsForDay.length === 0 ? (
                          <div className="h-[280px] bg-surface-container-low flex items-center justify-center px-6 text-center text-sm text-on-surface-variant">
                            No stops for this day in the snapshot.
                          </div>
                        ) : (
                          <TripRouteOverviewMap
                            waypoints={routeOverviewWaypointsForDay}
                            accessToken={env.MAPBOX_ACCESS_TOKEN}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-container-lowest border border-outline-variant p-5">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Destinations</p>
                      <p className="font-headline-lg text-headline-lg text-primary">{totalItems}</p>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant p-5">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Day</p>
                      <p className="font-headline-lg text-headline-lg text-primary">{draftDays.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </section>

            <div className="max-w-container-max mx-auto px-margin-edge py-stack-md flex justify-end gap-4 mb-stack-lg border-t border-outline-variant mt-stack-lg pt-12">
              <button
                type="button"
                className="px-10 py-4 border border-outline text-primary font-label-caps text-label-caps hover:bg-surface-variant transition-colors tracking-widest uppercase"
                onClick={() => {
                  if (!trip.data) return
                  const reset = [...trip.data.days]
                    .sort((a, b) => a.dayIndex - b.dayIndex)
                    .map((day) => ({
                      id: day.id,
                      dayIndex: day.dayIndex,
                      date: day.date,
                      items: [...day.items]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((item, idx) => ({ ...item, sortOrder: idx + 1 })),
                    }))
                  setDraftDays(reset)
                }}
              >
                Cancel Changes
              </button>
              <button
                type="button"
                disabled={!hasUnsavedChanges || hasTimeIssue || saveChanges.isPending}
                onClick={() => saveChanges.mutate()}
                className="px-10 py-4 bg-primary text-on-primary font-label-caps text-label-caps hover:bg-primary/90 transition-colors tracking-widest uppercase shadow-xl disabled:opacity-50"
              >
                {saveChanges.isPending ? 'Saving...' : 'Save Final Itinerary'}
              </button>
            </div>
            {saveChanges.isError && (
              <div className="max-w-container-max mx-auto px-margin-edge -mt-6 mb-4">
                <Alert variant="error" message={itinerarySaveErrorMessage(saveChanges.error)} />
              </div>
            )}
            {hasTimeIssue && (
              <div className="max-w-container-max mx-auto px-margin-edge -mt-6 mb-4">
                <Alert
                  variant="error"
                  message={
                    hasInvalidTimeRange && hasOverlap
                      ? 'Invalid time: fix start/end ranges and remove overlapping slots before saving.'
                      : hasInvalidTimeRange
                        ? 'Invalid time: each activity needs start before end.'
                        : 'Overlapping time slots on the same day — adjust times before saving.'
                  }
                />
              </div>
            )}

            <aside
              className={`fixed top-0 right-0 h-screen z-[70] w-[430px] bg-surface-container-lowest border-l border-outline-variant transition-transform duration-300 flex flex-col ${
                isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <TripDiscoverSidebar
                open={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                tripTitle={trip.data?.title ?? 'Trip'}
                targetDayId={targetDayId}
                selectedDayId={selectedDayId}
                onSelectedDayId={setSelectedDayId}
                dayOptions={dayOptions}
                tripDestinationId={trip.data?.destinationId ?? null}
                anchorSummary={discoverAnchorSummary}
                anchorPlacePayload={anchorPlacePayload}
                planningDayId={effectiveDayIdForAnchor}
                dayFallbackLatLng={dayFallbackLatLng}
                dayHasItemStops={dayHasItemStops}
                dayItineraryPlaceIds={dayItineraryPlaceIds}
                onSuggestAdd={(pid) => {
                  const dayId = selectedDayId || draftDays[0]?.id
                  if (!dayId) return
                  if (!id) return
                  void (async () => {
                    const isOverlapError = (err: unknown): boolean => {
                      if (!err || typeof err !== 'object') return false
                      const ax = err as {
                        response?: { data?: { message?: unknown } }
                        message?: string
                      }
                      const msg = ax.response?.data?.message
                      if (typeof msg === 'string' && msg.includes('trip_item_time_overlap')) return true
                      if (Array.isArray(msg) && msg.some((x) => typeof x === 'string' && x.includes('trip_item_time_overlap'))) {
                        return true
                      }
                      return typeof ax.message === 'string' && ax.message.includes('trip_item_time_overlap')
                    }
                    const fetchLatestSlot = async () => {
                      const latest = await tripsApi.getById(id)
                      const latestDay =
                        latest.days.find((d) => d.id === dayId) ??
                        latest.days[0]
                      return resolveNextTimeSlotForDay(latestDay)
                    }

                    for (let attempt = 0; attempt < 6; attempt += 1) {
                      try {
                        const slot = await fetchLatestSlot()
                        const start = hhmmToMinutes(slot.startTime) + attempt * 30
                        const end = hhmmToMinutes(slot.endTime) + attempt * 30
                        await addItem.mutateAsync({
                          dayId,
                          dto: {
                            placeId: pid,
                            type: 'restaurant',
                            startTime: minutesToHhmm(start),
                            endTime: minutesToHhmm(end),
                          },
                        })
                        setDiscoverLastAddedPlaceId(pid)
                        return
                      } catch (error) {
                        if (!isOverlapError(error) || attempt === 5) {
                          throw error
                        }
                      }
                    }
                  })()
                }}
                suggestAddPending={addItem.isPending}
              />
            </aside>
          </>
        )}
      </main>
    </PublicSiteLayout>
  )
}

function TripDayBlock({
  day,
  placeMetaMap,
  overlapItemIds,
  invalidRangeItemIds,
  draggingItemId,
  onItemTimeChange,
  onDragStart,
  onDropOnItem,
  onDropOnDay,
  onDeleteDay,
  onDeleteItem,
}: {
  day: DraftTripDay
  placeMetaMap: Map<string, { name: string; category: string; lat?: number; lng?: number }>
  overlapItemIds: Set<string>
  invalidRangeItemIds: Set<string>
  draggingItemId: string | null
  onItemTimeChange: (itemId: string, patch: { startTime?: string; endTime?: string }) => void
  onDragStart: (itemId: string) => void
  onDropOnItem: (targetItemId: string, targetDayId: string) => void
  onDropOnDay: (targetDayId: string) => void
  onDeleteDay: () => void
  onDeleteItem: (itemId: string) => void
}) {
  return (
    <div
      className="relative pl-10"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDropOnDay(day.id)}
    >
      <div className="absolute left-0 top-1 w-6 h-6 bg-primary flex items-center justify-center">
        <div className="w-2 h-2 bg-surface-container-lowest rounded-full" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-headline-md text-primary uppercase">
            Day {day.dayIndex}
          </h3>
          <button
            type="button"
            className="text-xs uppercase tracking-[0.12em] text-error hover:underline"
            onClick={onDeleteDay}
          >
            Delete day
          </button>
        </div>
        <p className="text-xs text-on-surface-variant uppercase tracking-[0.1em] mb-4">{day.date}</p>
        <div className="space-y-4">
          {day.items.length === 0 && <p className="text-sm text-on-surface-variant">No items yet.</p>}
          {day.items
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => {
              const placeMeta = placeMetaMap.get(item.placeId)
              const placeName = placeMeta?.name ?? `Place ${item.placeId.slice(0, 8)}`
              const placeCategory = placeMeta?.category ?? item.type
              const hasOverlap = overlapItemIds.has(item.id)
              const hasInvalidRange = invalidRangeItemIds.has(item.id)
              const hasIssue = hasOverlap || hasInvalidRange
              return (
              <div key={item.id} className="flex items-start gap-5">
                <div className="w-16 pt-2 text-xs text-on-surface-variant font-label-caps">
                  <div className="space-y-1">
                    <input
                      type="time"
                      lang="en-GB"
                      value={item.startTime}
                      onChange={(e) => onItemTimeChange(item.id, { startTime: e.target.value })}
                      min="00:00"
                      max="23:59"
                      step={300}
                      className="w-full border border-outline-variant px-1 py-1 text-[10px]"
                    />
                    <input
                      type="time"
                      lang="en-GB"
                      value={item.endTime}
                      onChange={(e) => onItemTimeChange(item.id, { endTime: e.target.value })}
                      min="00:00"
                      max="23:59"
                      step={300}
                      className="w-full border border-outline-variant px-1 py-1 text-[10px]"
                    />
                  </div>
                </div>
                <div
                  className={`flex-1 border p-4 ${hasIssue ? 'bg-error-container border-error' : 'bg-surface-container-lowest border-outline-variant'} ${
                    draggingItemId === item.id ? 'opacity-70' : ''
                  }`}
                  draggable
                  onDragStart={() => onDragStart(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.stopPropagation()
                    onDropOnItem(item.id, day.id)
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-headline-md font-bold text-primary">{placeName}</p>
                      <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-[0.1em]">
                        {placeCategory}
                      </p>
                      <p className="text-xs text-on-surface-variant">Time: {item.startTime} - {item.endTime}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="material-symbols-outlined text-on-surface-variant hover:text-error"
                    >
                      delete
                    </button>
                  </div>
                  {item.note && <p className="mt-3 text-sm text-on-surface">{item.note}</p>}
                  <div className="mt-3">
                    <span className="px-2 py-1 bg-surface-container text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
                      {placeCategory}
                    </span>
                  </div>
                </div>
              </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

interface IntervalMin {
  lo: number
  hi: number
}

function hhmmToMinutes(value: string): number {
  const [hh, mm] = value.split(':').map((n) => Number(n))
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0
  return hh * 60 + mm
}

function minutesToHhmm(totalMinutes: number): string {
  const safe = Math.max(0, Math.min(24 * 60 - 1, totalMinutes))
  const hh = Math.floor(safe / 60)
  const mm = safe % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function resolveNextTimeSlotForDay(day?: { items: Array<{ endTime: string }> }): {
  startTime: string
  endTime: string
} {
  if (!day || day.items.length === 0) {
    return { startTime: '09:00', endTime: '11:00' }
  }
  const latestEndMinutes = day.items
    .map((item) => hhmmToMinutes(item.endTime))
    .sort((a, b) => b - a)[0]

  const start = Math.min(latestEndMinutes + 30, 21 * 60)
  const end = Math.min(start + 120, 23 * 60 + 30)
  return {
    startTime: minutesToHhmm(start),
    endTime: minutesToHhmm(end),
  }
}

/** Backend overlap rule: intervals intersect when neither ends strictly before the other starts. */
function intervalsOverlapMin(a: IntervalMin, b: IntervalMin): boolean {
  return a.lo < b.hi && b.lo < a.hi
}

/**
 * Placeholder slots for same-day multi-reschedule: sequential PATCH order cannot swap two intervals
 * without an intermediate collision — move everyone to disjoint temps first, then apply finals.
 */
function findDisjointTempIntervals(count: number, blocked: IntervalMin[]): IntervalMin[] {
  const duration = 45
  const chosen: IntervalMin[] = []
  /** Keep end strictly before 24:00 so HH:mm stays valid for the API. */
  for (let start = 0; start + duration <= 23 * 60 + 59; start += 5) {
    const cand: IntervalMin = { lo: start, hi: start + duration }
    let ok = true
    for (const b of blocked) {
      if (intervalsOverlapMin(cand, b)) {
        ok = false
        break
      }
    }
    if (!ok) continue
    for (const prev of chosen) {
      if (intervalsOverlapMin(cand, prev)) {
        ok = false
        break
      }
    }
    if (!ok) continue
    chosen.push(cand)
    if (chosen.length === count) return chosen
  }
  throw new Error('trip_save_no_temp_slot')
}

function moveItemAcrossDays(
  days: DraftTripDay[],
  draggingItemId: string | null,
  targetDayId: string,
  targetItemId?: string,
): DraftTripDay[] {
  if (!draggingItemId) return days

  let sourceDayId: string | null = null
  let movingItem: DraftTripItem | null = null

  for (const d of days) {
    const found = d.items.find((it) => it.id === draggingItemId)
    if (found) {
      sourceDayId = d.id
      movingItem = found
      break
    }
  }
  if (!sourceDayId || !movingItem) return days

  return days.map((d) => {
    if (d.id === sourceDayId && d.id === targetDayId) {
      if (!targetItemId || targetItemId === draggingItemId) return d
      const fromIdx = d.items.findIndex((it) => it.id === draggingItemId)
      const toIdx = d.items.findIndex((it) => it.id === targetItemId)
      if (fromIdx < 0 || toIdx < 0) return d
      const clone = [...d.items]
      const [moved] = clone.splice(fromIdx, 1)
      clone.splice(toIdx, 0, moved)
      return { ...d, items: clone.map((it, idx) => ({ ...it, sortOrder: idx + 1 })) }
    }

    if (d.id === sourceDayId) {
      const remaining = d.items.filter((it) => it.id !== draggingItemId)
      return { ...d, items: remaining.map((it, idx) => ({ ...it, sortOrder: idx + 1 })) }
    }

    if (d.id === targetDayId) {
      const clone = [...d.items]
      if (targetItemId) {
        const targetIdx = clone.findIndex((it) => it.id === targetItemId)
        const insertIdx = targetIdx >= 0 ? targetIdx : clone.length
        clone.splice(insertIdx, 0, movingItem)
      } else {
        clone.push(movingItem)
      }
      return { ...d, items: clone.map((it, idx) => ({ ...it, sortOrder: idx + 1 })) }
    }

    return d
  })
}
