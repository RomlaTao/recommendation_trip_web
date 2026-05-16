import { useEffect, useMemo, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { useMapboxDrivingRoute } from '@/features/trips/hooks/use-mapbox-driving-route'
import { straightLineCoordinates } from '@/features/trips/lib/mapbox-directions'
import type { TripRouteWaypoint } from '@/features/trips/types/trips.types'

export { routeOverviewStraightLineKm } from '@/features/trips/lib/mapbox-directions'

interface TripRouteOverviewMapProps {
  waypoints: TripRouteWaypoint[]
  accessToken: string
  className?: string
}

function setRouteLine(map: mapboxgl.Map, coordinates: [number, number][]) {
  if (coordinates.length < 2) {
    if (map.getLayer('trip-route-line')) map.removeLayer('trip-route-line')
    if (map.getSource('trip-route')) map.removeSource('trip-route')
    return
  }

  const feature = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates,
    },
  }

  const existing = map.getSource('trip-route') as mapboxgl.GeoJSONSource | undefined
  if (existing) {
    existing.setData(feature)
    return
  }

  map.addSource('trip-route', { type: 'geojson', data: feature })
  map.addLayer({
    id: 'trip-route-line',
    type: 'line',
    source: 'trip-route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#0b513d',
      'line-width': 4,
      'line-opacity': 0.88,
    },
  })
}

function fitMapToCoordinates(map: mapboxgl.Map, coordinates: [number, number][]) {
  if (coordinates.length === 0) return
  if (coordinates.length === 1) {
    map.setCenter(coordinates[0])
    map.setZoom(12)
    return
  }
  const bounds = coordinates.reduce(
    (b, coord) => b.extend(coord as mapboxgl.LngLatLike),
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
  )
  map.fitBounds(bounds, { padding: 56, maxZoom: 14 })
}

function addWaypointMarkers(map: mapboxgl.Map, waypoints: TripRouteWaypoint[]) {
  const n = waypoints.length
  waypoints.forEach((w, i) => {
    let roleLabel = ''
    let markerColor = '#334155'
    if (n === 1) {
      roleLabel = 'Single stop'
      markerColor = '#15803d'
    } else if (i === 0) {
      roleLabel = 'Start'
      markerColor = '#15803d'
    } else if (i === n - 1) {
      roleLabel = 'End'
      markerColor = '#b91c1c'
    } else {
      roleLabel = `Stop ${i + 1}`
    }

    const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
      `<div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${markerColor}">${escapeHtml(roleLabel)}</div>` +
        `<div style="font-size:12px;font-weight:600;margin-top:4px">${escapeHtml(w.name)}</div>` +
        `<div style="font-size:11px;opacity:0.75;margin-top:2px">Day ${w.dayIndex}</div>`,
    )
    new mapboxgl.Marker({ color: markerColor })
      .setLngLat([w.lng, w.lat])
      .setPopup(popup)
      .addTo(map)
  })
}

export function TripRouteOverviewMap({
  waypoints,
  accessToken,
  className = '',
}: TripRouteOverviewMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const routeQuery = useMapboxDrivingRoute(waypoints, accessToken)

  const lineCoordinates = useMemo((): [number, number][] => {
    if (waypoints.length < 2) return []
    if (routeQuery.data?.coordinates.length) return routeQuery.data.coordinates
    return straightLineCoordinates(waypoints)
  }, [waypoints, routeQuery.data])

  const showRouteLoading = waypoints.length >= 2 && routeQuery.isLoading

  useEffect(() => {
    if (!containerRef.current || !accessToken.trim() || waypoints.length === 0) return

    mapboxgl.accessToken = accessToken

    const waypointCoords = waypoints.map((w) => [w.lng, w.lat] as [number, number])
    const initialLine =
      lineCoordinates.length >= 2 ? lineCoordinates : waypointCoords

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: waypointCoords[0],
      zoom: waypointCoords.length === 1 ? 12 : 10,
    })

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      if (initialLine.length >= 2) setRouteLine(map, initialLine)
      addWaypointMarkers(map, waypoints)
      fitMapToCoordinates(map, initialLine.length >= 2 ? initialLine : waypointCoords)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // Map instance is tied to waypoint set / token only; route geometry updates in a separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, waypoints])

  useEffect(() => {
    const map = mapRef.current
    if (!map || waypoints.length < 2 || lineCoordinates.length < 2) return

    const apply = () => {
      setRouteLine(map, lineCoordinates)
      fitMapToCoordinates(map, lineCoordinates)
    }

    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [lineCoordinates, waypoints.length])

  return (
    <div className={`relative min-h-[320px] w-full ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {showRouteLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
          <span className="rounded-md bg-surface-container-highest/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant shadow-sm">
            Loading driving route…
          </span>
        </div>
      )}
    </div>
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
