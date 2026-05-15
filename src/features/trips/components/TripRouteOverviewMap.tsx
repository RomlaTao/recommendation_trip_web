import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import type { TripRouteWaypoint } from '@/features/trips/types/trips.types'

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la = (a.lat * Math.PI) / 180
  const lb = (b.lat * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

/** Straight-line distance along frozen waypoint order (not driving distance). */
export function routeOverviewStraightLineKm(waypoints: TripRouteWaypoint[]): number {
  let sum = 0
  for (let i = 1; i < waypoints.length; i += 1) {
    sum += haversineKm(waypoints[i - 1], waypoints[i])
  }
  return sum
}

interface TripRouteOverviewMapProps {
  waypoints: TripRouteWaypoint[]
  accessToken: string
  className?: string
}

export function TripRouteOverviewMap({
  waypoints,
  accessToken,
  className = '',
}: TripRouteOverviewMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || !accessToken.trim() || waypoints.length === 0) return

    mapboxgl.accessToken = accessToken

    const coordinates = waypoints.map((w) => [w.lng, w.lat] as [number, number])

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates[0],
      zoom: coordinates.length === 1 ? 12 : 10,
    })

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      if (coordinates.length >= 2) {
        map.addSource('trip-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        })
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

      if (coordinates.length >= 2) {
        const bounds = coordinates.reduce(
          (b, coord) => b.extend(coord as mapboxgl.LngLatLike),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
        )
        map.fitBounds(bounds, { padding: 56, maxZoom: 14 })
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [accessToken, waypoints])

  return <div ref={containerRef} className={`min-h-[320px] w-full ${className}`} />
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
