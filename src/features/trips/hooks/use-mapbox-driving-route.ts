import { useQuery } from '@tanstack/react-query'

import {
  fetchMapboxDrivingRoute,
  mapboxDrivingRouteQueryKey,
  routeOverviewStraightLineKm,
  straightLineCoordinates,
} from '@/features/trips/lib/mapbox-directions'
import type { MapboxDrivingRoute } from '@/features/trips/lib/mapbox-directions'
import type { TripRouteWaypoint } from '@/features/trips/types/trips.types'

export interface MapboxDrivingRouteResult extends MapboxDrivingRoute {
  isDrivingRoute: boolean
}

export function useMapboxDrivingRoute(waypoints: TripRouteWaypoint[], accessToken: string) {
  const enabled = waypoints.length >= 2 && accessToken.trim().length > 0

  return useQuery({
    queryKey: ['mapbox-driving-route', mapboxDrivingRouteQueryKey(waypoints)],
    queryFn: async (): Promise<MapboxDrivingRouteResult> => {
      const driving = await fetchMapboxDrivingRoute(waypoints, accessToken)
      if (driving) {
        return { ...driving, isDrivingRoute: true }
      }

      return {
        coordinates: straightLineCoordinates(waypoints),
        distanceMeters: routeOverviewStraightLineKm(waypoints) * 1000,
        durationSeconds: 0,
        isDrivingRoute: false,
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useRouteOverviewMetrics(waypoints: TripRouteWaypoint[], accessToken: string) {
  const query = useMapboxDrivingRoute(waypoints, accessToken)

  const distanceKm = query.data
    ? query.data.distanceMeters / 1000
    : waypoints.length >= 2
      ? routeOverviewStraightLineKm(waypoints)
      : 0

  const durationMinutes = query.data?.durationSeconds
    ? Math.round(query.data.durationSeconds / 60)
    : 0

  return {
    distanceKm,
    durationMinutes,
    isDrivingRoute: query.data?.isDrivingRoute ?? false,
    isLoading: query.isLoading && query.isFetching,
  }
}
