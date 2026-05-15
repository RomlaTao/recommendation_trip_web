export interface DestinationCenter {
  lat: number
  lng: number
}

const DESTINATION_CENTER_BY_SLUG: Record<string, DestinationCenter> = {
  'ho-chi-minh': { lat: 10.762622, lng: 106.660172 },
  'da-lat': { lat: 11.9404192, lng: 108.4583136 },
  'vung-tau': { lat: 10.346, lng: 107.084262 },
}

export function destinationCenterFromSlug(slug?: string | null): DestinationCenter | null {
  if (!slug) return null
  return DESTINATION_CENTER_BY_SLUG[slug] ?? null
}
