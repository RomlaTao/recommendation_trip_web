/** Matches ml-model-service `ItineraryRecommendationRequest` / `ItineraryRecommendationResponse` (snake_case). */

export interface ItineraryUserContext {
  user_id: string
}

export interface ItineraryLastLocation {
  latitude: number
  longitude: number
}

export interface ItineraryTripContext {
  region_id: string
  current_time: string
}

export interface ItineraryDayContext {
  day_id: string
  last_location: ItineraryLastLocation
  draft_route_ids: string[]
}

export interface ItineraryConstraints {
  radius_km: number
  top_k: number
  category_filter: string[]
}

export interface ItineraryRecommendationRequest {
  user_context: ItineraryUserContext
  trip_context: ItineraryTripContext
  day_context: ItineraryDayContext
  constraints: ItineraryConstraints
}

export interface ItineraryRecommendationItem {
  location_id: string
  score: number
  distance_km: number
}

export interface ItineraryRecommendationMetadata {
  model_version: string
  inference_time_ms: number
  candidates_scored: number
}

export interface ItineraryRecommendationResponse {
  recommendations: ItineraryRecommendationItem[]
  metadata: ItineraryRecommendationMetadata
}
