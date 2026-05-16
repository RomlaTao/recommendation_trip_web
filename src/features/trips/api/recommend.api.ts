import { env } from '@/config/env'
import type {
  ItineraryRecommendationRequest,
  ItineraryRecommendationResponse,
} from '@/features/trips/types/recommend.types'

export async function postItineraryRecommendations(
  body: ItineraryRecommendationRequest,
): Promise<ItineraryRecommendationResponse> {
  const base = env.RERANK_API_BASE_URL
  if (!base) {
    throw new Error('Missing VITE_RERANK_API_BASE_URL (must include /api/v1)')
  }
  const res = await fetch(`${base}/itinerary/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Itinerary recommendations failed (${res.status})`)
  }
  return res.json() as Promise<ItineraryRecommendationResponse>
}
