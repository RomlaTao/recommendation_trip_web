import type { TripRouteWaypoint } from '@/features/trips/types/trips.types'

/** Mapbox Directions API limit per request (inclusive of start/end). */
const MAX_WAYPOINTS_PER_REQUEST = 25

export interface MapboxDrivingRoute {
  coordinates: [number, number][]
  distanceMeters: number
  durationSeconds: number
}

interface MapboxDirectionsResponse {
  routes?: Array<{
    geometry?: { coordinates?: [number, number][] }
    distance?: number
    duration?: number
  }>
  code?: string
  message?: string
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la = (a.lat * Math.PI) / 180
  const lb = (b.lat * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

/** Straight-line distance along frozen waypoint order (fallback when Directions fails). */
export function routeOverviewStraightLineKm(waypoints: TripRouteWaypoint[]): number {
  let sum = 0
  for (let i = 1; i < waypoints.length; i += 1) {
    sum += haversineKm(waypoints[i - 1], waypoints[i])
  }
  return sum
}

export function straightLineCoordinates(
  waypoints: TripRouteWaypoint[],
): [number, number][] {
  return waypoints.map((w) => [w.lng, w.lat])
}

export function mapboxDrivingRouteQueryKey(waypoints: TripRouteWaypoint[]): string {
  return waypoints.map((w) => `${w.tripItemId}:${w.lat},${w.lng}`).join('|')
}

function chunkWaypoints(waypoints: TripRouteWaypoint[]): TripRouteWaypoint[][] {
  if (waypoints.length <= MAX_WAYPOINTS_PER_REQUEST) return [waypoints]

  const chunks: TripRouteWaypoint[][] = []
  let start = 0
  while (start < waypoints.length) {
    const end = Math.min(start + MAX_WAYPOINTS_PER_REQUEST, waypoints.length)
    chunks.push(waypoints.slice(start, end))
    if (end >= waypoints.length) break
    start = end - 1
  }
  return chunks
}

function mergeLineCoordinates(segments: [number, number][][]): [number, number][] {
  const merged: [number, number][] = []
  for (const segment of segments) {
    if (segment.length === 0) continue
    if (merged.length === 0) {
      merged.push(...segment)
      continue
    }
    const [prevLng, prevLat] = merged[merged.length - 1]
    const [nextLng, nextLat] = segment[0]
    const isDuplicate =
      Math.abs(prevLng - nextLng) < 1e-9 && Math.abs(prevLat - nextLat) < 1e-9
    merged.push(...(isDuplicate ? segment.slice(1) : segment))
  }
  return merged
}

async function fetchDirectionsSegment(
  waypoints: TripRouteWaypoint[],
  accessToken: string,
): Promise<MapboxDrivingRoute | null> {
  if (waypoints.length < 2) return null

  const coordPath = waypoints.map((w) => `${w.lng},${w.lat}`).join(';')
  const params = new URLSearchParams({
    geometries: 'geojson',
    overview: 'full',
    access_token: accessToken,
  })
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordPath}?${params}`

  const res = await fetch(url)
  if (!res.ok) return null

  const body = (await res.json()) as MapboxDirectionsResponse
  const route = body.routes?.[0]
  const coordinates = route?.geometry?.coordinates
  if (!coordinates || coordinates.length < 2) return null

  return {
    coordinates,
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0,
  }
}

/** Road-following route geometry and metrics via Mapbox Directions API. */
export async function fetchMapboxDrivingRoute(
  waypoints: TripRouteWaypoint[],
  accessToken: string,
): Promise<MapboxDrivingRoute | null> {
  const token = accessToken.trim()
  if (waypoints.length < 2 || !token) return null

  const chunks = chunkWaypoints(waypoints)
  const segmentResults = await Promise.all(
    chunks.map((chunk) => fetchDirectionsSegment(chunk, token)),
  )

  if (segmentResults.some((r) => r === null)) return null

  const routes = segmentResults as MapboxDrivingRoute[]
  return {
    coordinates: mergeLineCoordinates(routes.map((r) => r.coordinates)),
    distanceMeters: routes.reduce((sum, r) => sum + r.distanceMeters, 0),
    durationSeconds: routes.reduce((sum, r) => sum + r.durationSeconds, 0),
  }
}
