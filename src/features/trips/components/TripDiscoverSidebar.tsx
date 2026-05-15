import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store'
import { env } from '@/config/env'
import { placesApi } from '@/features/places/api/places.api'
import type { PlaceListItem } from '@/features/places/types/places.types'
import { postItineraryRecommendations } from '@/features/trips/api/recommend.api'

type DiscoverChip = 'all' | 'hotels' | 'dining' | 'art' | 'cocktails'

const CHIPS: { id: DiscoverChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'dining', label: 'Dining' },
  { id: 'art', label: 'Art & history' },
  { id: 'cocktails', label: 'Cocktails' },
]

const BATCH_SIZE = 10
const DISCOVER_RADIUS_KM = 10
const DESTINATION_SEARCH_LIMIT_MAX = 50

function chipDisplayLabel(label: string): string {
  return label.toUpperCase()
}

function chipToCategoryFilter(chip: DiscoverChip): string[] {
  switch (chip) {
    case 'hotels':
      return ['hotel', 'stay', 'resort', 'lodge', 'hostel']
    case 'dining':
      return ['restaurant', 'cafe', 'dining', 'food', 'bistro']
    case 'art':
      return ['museum', 'gallery', 'history', 'heritage', 'monument', 'art']
    case 'cocktails':
      return ['bar', 'pub', 'cocktail', 'wine', 'lounge']
    default:
      return []
  }
}

function matchesChip(place: PlaceListItem, chip: DiscoverChip): boolean {
  if (chip === 'all') return true
  const n = `${place.name} ${place.categoryName ?? ''} ${place.address}`.toLowerCase()
  switch (chip) {
    case 'hotels':
      return /\b(hotel|stay|resort|lodge|hostel)\b/i.test(n)
    case 'dining':
      return /\b(restaurant|cafe|dining|bistro|food|kitchen)\b/i.test(n)
    case 'art':
      return /\b(museum|gallery|history|heritage|monument|cathedral|palace|art)\b/i.test(n)
    case 'cocktails':
      return /\b(bar|pub|cocktail|wine|lounge)\b/i.test(n)
    default:
      return true
  }
}

function ratingLabel(p: PlaceListItem): string {
  const r = p.communityRating.averageRating ?? p.seedRating.averageRating
  if (r == null || !Number.isFinite(r)) return '—'
  return r.toFixed(1)
}

function neighborhoodLabel(p: PlaceListItem): string {
  const raw = p.address?.trim()
  if (!raw) return (p.categoryName ?? '').toUpperCase() || '—'
  const first = raw.split(',')[0]?.trim() ?? raw
  return first.length > 42 ? `${first.slice(0, 40)}…` : first.toUpperCase()
}

export interface TripDiscoverSidebarProps {
  open: boolean
  onClose: () => void
  tripTitle: string
  targetDayId: string
  selectedDayId: string
  onSelectedDayId: (dayId: string) => void
  dayOptions: { id: string; label: string }[]
  tripDestinationId: string | null
  /** Copy for the compact anchor info card (no manual picker). */
  anchorSummary: string
  anchorPlacePayload: { place_id: string; lat: number; lng: number } | null
  tripFallbackLatLng: { lat: number; lng: number }
  /** False when itinerary has no stops yet — UI hint only; queries still run using fallback coords. */
  tripHasItemStops: boolean
  itineraryPlaceIds: Set<string>
  onSuggestAdd: (placeId: string) => void
  suggestAddPending: boolean
}

export function TripDiscoverSidebar({
  open,
  onClose,
  tripTitle,
  targetDayId,
  selectedDayId,
  onSelectedDayId,
  dayOptions,
  tripDestinationId,
  anchorSummary,
  anchorPlacePayload,
  tripFallbackLatLng,
  tripHasItemStops,
  itineraryPlaceIds,
  onSuggestAdd,
  suggestAddPending,
}: TripDiscoverSidebarProps) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? 'guest'

  const [searchQuery, setSearchQuery] = useState('')
  const [chip, setChip] = useState<DiscoverChip>('all')
  const [recommendBatch, setRecommendBatch] = useState(0)

  const refCoords = useMemo(() => {
    if (
      anchorPlacePayload &&
      Number.isFinite(anchorPlacePayload.lat) &&
      Number.isFinite(anchorPlacePayload.lng)
    ) {
      return { lat: anchorPlacePayload.lat, lng: anchorPlacePayload.lng }
    }
    return tripFallbackLatLng
  }, [anchorPlacePayload, tripFallbackLatLng])

  useEffect(() => {
    if (!open) return
    setRecommendBatch(0)
  }, [open, tripDestinationId])
  useEffect(() => {
    setRecommendBatch(0)
  }, [chip, searchQuery])

  const searchTrimmed = searchQuery.trim()

  const destinationQuery = useQuery({
    queryKey: [
      'places',
      'search',
      'discover-sidebar',
      'destination-all',
      tripDestinationId,
      searchTrimmed,
    ],
    queryFn: async () => {
      const q = searchTrimmed || undefined
      const first = await placesApi.search({
        destinationId: tripDestinationId ?? undefined,
        q,
        sort: 'rating_desc',
        page: 1,
        limit: DESTINATION_SEARCH_LIMIT_MAX,
      })
      const totalPages = Math.ceil(first.total / DESTINATION_SEARCH_LIMIT_MAX)
      if (totalPages <= 1) return first.items

      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }).map((_, idx) =>
          placesApi.search({
            destinationId: tripDestinationId ?? undefined,
            q,
            sort: 'rating_desc',
            page: idx + 2,
            limit: DESTINATION_SEARCH_LIMIT_MAX,
          }),
        ),
      )
      return [first.items, ...rest.map((r) => r.items)].flat()
    },
    enabled: open && Boolean(tripDestinationId),
    staleTime: 30_000,
  })

  const baseCandidates = useMemo(() => {
    const rows = destinationQuery.data ?? []
    const anchorId = anchorPlacePayload?.place_id
    return rows.filter((p) => {
      if (itineraryPlaceIds.has(p.id)) return false
      if (anchorId && p.id === anchorId) return false
      return true
    })
  }, [destinationQuery.data, itineraryPlaceIds, anchorPlacePayload?.place_id])

  const activeCandidates = useMemo(
    () => baseCandidates.filter((p) => matchesChip(p, chip)),
    [baseCandidates, chip],
  )

  const candidateIds = useMemo(
    () => activeCandidates.map((p) => p.id).filter(Boolean),
    [activeCandidates],
  )
  const topK = useMemo(
    () => Math.min(Math.max(BATCH_SIZE * (1 + recommendBatch), 1), 100),
    [recommendBatch],
  )
  const canLoadMore = topK < 100

  const draftRouteIds = useMemo(() => {
    const ids = new Set(itineraryPlaceIds)
    const anchorId = anchorPlacePayload?.place_id
    if (anchorId) ids.add(anchorId)
    return [...ids]
  }, [itineraryPlaceIds, anchorPlacePayload?.place_id])

  const rerankEnabled =
    open &&
    Boolean(env.RERANK_API_BASE_URL) &&
    Boolean(tripDestinationId) &&
    Number.isFinite(refCoords.lat) &&
    Number.isFinite(refCoords.lng)

  const recommendQuery = useQuery({
    queryKey: [
      'ml',
      'itinerary-recommendations',
      userId,
      tripDestinationId,
      chip,
      draftRouteIds.join('|'),
      refCoords.lat,
      refCoords.lng,
      DISCOVER_RADIUS_KM,
      topK,
    ],
    queryFn: () =>
      postItineraryRecommendations({
        user_context: { user_id: userId },
        trip_context: {
          region_id: tripDestinationId ?? '',
          current_time: new Date().toISOString(),
          last_location: {
            latitude: refCoords.lat,
            longitude: refCoords.lng,
          },
          draft_route_ids: draftRouteIds,
        },
        constraints: {
          radius_km: DISCOVER_RADIUS_KM,
          top_k: topK,
          category_filter: chipToCategoryFilter(chip),
        },
      }),
    enabled: rerankEnabled,
    staleTime: 30_000,
  })

  const placeById = useMemo(() => {
    const m = new Map<string, PlaceListItem>()
    for (const p of activeCandidates) m.set(p.id, p)
    return m
  }, [activeCandidates])

  const rankedPlaces = useMemo(() => {
    const results = recommendQuery.data?.recommendations ?? []
    const ordered: PlaceListItem[] = []
    const seen = new Set<string>()
    for (const r of results) {
      const place = placeById.get(r.location_id)
      if (place && !seen.has(place.id)) {
        seen.add(place.id)
        ordered.push(place)
      }
    }
    if (ordered.length === 0 && recommendQuery.isSuccess && activeCandidates.length > 0) {
      return activeCandidates.slice(0, topK)
    }
    return ordered
  }, [
    recommendQuery.data?.recommendations,
    recommendQuery.isSuccess,
    placeById,
    activeCandidates,
    topK,
  ])

  const filteredRows = useMemo(() => {
    return rankedPlaces
  }, [rankedPlaces])

  const heading = tripTitle.trim() || 'Trip'
  const anchorCoordsLine =
    anchorPlacePayload &&
    Number.isFinite(anchorPlacePayload.lat) &&
    Number.isFinite(anchorPlacePayload.lng)
      ? `${anchorPlacePayload.lat.toFixed(5)}, ${anchorPlacePayload.lng.toFixed(5)}`
      : `${refCoords.lat.toFixed(5)}, ${refCoords.lng.toFixed(5)}${
          tripHasItemStops ? ' (trip centroid)' : ' (default map center)'
        }`

  return (
    <>
      <div className="shrink-0 pt-24 px-6 pb-4 border-b border-outline-variant flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-headline-md text-primary uppercase tracking-[0.12em] leading-tight">
            Discover · {heading.length > 32 ? `${heading.slice(0, 30)}…` : heading}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant mt-1">
            Within {DISCOVER_RADIUS_KM} km of your anchor
          </p>
        </div>
        <button
          type="button"
          className="material-symbols-outlined shrink-0 text-on-surface-variant hover:text-primary"
          aria-label="Close discover panel"
          onClick={onClose}
        >
          close
        </button>
      </div>

      <div className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
        {!env.RERANK_API_BASE_URL ? (
          <p className="text-xs text-error border border-error/40 bg-error-container/30 px-3 py-2 rounded-lg">
            Set <code className="font-mono text-[10px]">VITE_RERANK_API_BASE_URL</code> (e.g.{' '}
            <code className="font-mono text-[10px]">http://localhost:8001/api/v1</code>) to load ranked
            places.
          </p>
        ) : null}

        {!tripHasItemStops ? (
          <p className="text-xs text-on-surface-variant border border-outline-variant rounded-xl px-4 py-3 bg-surface-container-low leading-relaxed">
            No stops yet — suggestions still load using popularity and distance from the{' '}
            <span className="font-semibold text-primary">default map center</span>. Add places to your trip to rank
            around your real route.
          </p>
        ) : null}

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-outline-variant rounded-xl pl-11 pr-4 py-3 text-sm bg-surface-container-lowest placeholder:text-on-surface-variant/70"
            placeholder="Search by name or neighborhood..."
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChip(c.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] border transition-colors ${
                chip === c.id
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {chipDisplayLabel(c.label)}
            </button>
          ))}
        </div>

        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            Trip day
          </span>
          <select
            value={selectedDayId}
            onChange={(e) => onSelectedDayId(e.target.value)}
            className="w-full border border-outline-variant rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] bg-surface-container-lowest"
          >
            <option value="">Select day</option>
            {dayOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            Distance anchor
          </p>
          <p className="text-xs text-primary leading-snug">{anchorSummary}</p>
          <p className="text-[10px] font-mono text-on-surface-variant break-all opacity-80">
            {anchorCoordsLine}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-3">
            Selected for your itinerary
          </p>

          {!tripDestinationId ? (
            <p className="text-sm text-on-surface-variant">Trip has no destination.</p>
          ) : destinationQuery.isLoading ? (
            <p className="text-sm text-on-surface-variant">Loading destination places…</p>
          ) : destinationQuery.isError ? (
            <p className="text-sm text-error">Could not load place candidates.</p>
          ) : recommendQuery.isError ? (
            <p className="text-sm text-error">
              {(recommendQuery.error as Error)?.message ?? 'ML ranking service unavailable.'}
            </p>
          ) : recommendQuery.isFetching && !recommendQuery.data ? (
            <p className="text-sm text-on-surface-variant">Ranking suggestions…</p>
          ) : filteredRows.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              {candidateIds.length === 0
                ? 'No places in this destination match your filters.'
                : `No ranked matches within ${DISCOVER_RADIUS_KM} km — try More options or adjust filters.`}
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredRows.map((place) => (
                <li
                  key={place.id}
                  className="flex gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3"
                >
                  <div className="w-20 h-20 shrink-0 rounded-lg bg-surface-container-high overflow-hidden border border-outline-variant/60">
                    {place.thumbnailUrl ? (
                      <img src={place.thumbnailUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center material-symbols-outlined text-on-surface-variant/50">
                        image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-2">
                    <div>
                      <p className="text-headline-sm font-bold text-primary uppercase tracking-[0.06em] leading-tight line-clamp-2">
                        {place.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        ★ {ratingLabel(place)} · {neighborhoodLabel(place)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <Link
                        to={`/places/${place.id}`}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-outline-variant text-[10px] font-bold uppercase tracking-[0.12em] text-primary hover:bg-surface-container-high transition-colors"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        disabled={!targetDayId || suggestAddPending}
                        onClick={() => onSuggestAdd(place.id)}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-primary text-on-primary text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          disabled={
            destinationQuery.isFetching ||
            recommendQuery.isFetching ||
            !Number.isFinite(refCoords.lat) ||
            !Number.isFinite(refCoords.lng) ||
            !canLoadMore
          }
          onClick={() => setRecommendBatch((n) => n + 1)}
          className="w-full py-4 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-primary/90 disabled:opacity-45 transition-colors shadow-lg"
        >
          {destinationQuery.isFetching || recommendQuery.isFetching ? 'Loading…' : 'More options'}
        </button>
        <p className="text-[10px] text-center text-on-surface-variant -mt-3 uppercase tracking-[0.12em]">
          Adds next {BATCH_SIZE} ranked places (from this destination)
        </p>
      </div>
    </>
  )
}
