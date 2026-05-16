/**
 * Cho rerank / recommend: neo khoảng cách theo ngày trong Trip.
 * - Có ít nhất một TripItem trong ngày → place của item **dưới cùng** (sortOrder lớn nhất sau khi sort tăng dần).
 * - Ngày trống → fallback **hotel** trên trip: ưu tiên hotel ở ngày có dayIndex ≤ ngày hiện tại (lấy ngày gần nhất),
 *   rồi mới tới hotel ở ngày sau (sớm nhất).
 */

export type RecommendAnchorSource = 'bottom_item' | 'hotel_fallback'

export interface TripDayLikeForAnchor {
  id: string
  dayIndex: number
  items: Array<{ placeId: string; type: string; sortOrder: number }>
}

export interface RecommendAnchorResolution {
  placeId: string | null
  source: RecommendAnchorSource | null
}

function isHotelType(type: string): boolean {
  return String(type).trim().toLowerCase() === 'hotel'
}

/** Hotels as (dayIndex, sortOrder, placeId) for fallback ranking. */
function collectHotelSlots(days: TripDayLikeForAnchor[]) {
  const out: Array<{ dayIndex: number; sortOrder: number; placeId: string }> = []
  for (const d of days) {
    for (const it of d.items) {
      if (isHotelType(it.type)) {
        out.push({
          dayIndex: d.dayIndex,
          sortOrder: it.sortOrder,
          placeId: it.placeId,
        })
      }
    }
  }
  return out
}

function pickHotelForEmptyDay(
  daysSortedByDayIndex: TripDayLikeForAnchor[],
  currentDayIndex: number,
): { placeId: string } | null {
  const hotels = collectHotelSlots(daysSortedByDayIndex)
  if (hotels.length === 0) return null

  const onOrBefore = hotels.filter((h) => h.dayIndex <= currentDayIndex)
  if (onOrBefore.length > 0) {
    const maxDay = Math.max(...onOrBefore.map((h) => h.dayIndex))
    const onMaxDay = onOrBefore
      .filter((h) => h.dayIndex === maxDay)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    const last = onMaxDay[onMaxDay.length - 1]
    return last ? { placeId: last.placeId } : null
  }

  const after = hotels
    .filter((h) => h.dayIndex > currentDayIndex)
    .sort((a, b) => a.dayIndex - b.dayIndex || a.sortOrder - b.sortOrder)
  const first = after[0]
  return first ? { placeId: first.placeId } : null
}

/**
 * @param days Trip days sorted by dayIndex (caller typically already sorts).
 * @param selectedDayId Day id chọn trên UI; empty → không resolve (caller có thể fallback ngày đầu).
 */
export function resolveRecommendAnchorPlaceId(
  days: TripDayLikeForAnchor[],
  selectedDayId: string,
): RecommendAnchorResolution {
  if (!selectedDayId.trim()) {
    return { placeId: null, source: null }
  }

  const day = days.find((d) => d.id === selectedDayId)
  if (!day) {
    return { placeId: null, source: null }
  }

  const ordered = [...day.items].sort((a, b) => a.sortOrder - b.sortOrder)
  if (ordered.length > 0) {
    const bottom = ordered[ordered.length - 1]
    return { placeId: bottom.placeId, source: 'bottom_item' }
  }

  const hotel = pickHotelForEmptyDay(days, day.dayIndex)
  if (hotel) {
    return { placeId: hotel.placeId, source: 'hotel_fallback' }
  }

  return { placeId: null, source: null }
}

/** Anchor coords for discover sidebar / itinerary `day_context.last_location`. */
export function buildAnchorPlacePoint(
  placeId: string | null | undefined,
  coordsByPlaceId: Map<string, { lat: number; lng: number }>,
): { place_id: string; lat: number; lng: number } | null {
  if (!placeId?.trim()) return null
  const c = coordsByPlaceId.get(placeId)
  if (!c || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) return null
  return { place_id: placeId, lat: c.lat, lng: c.lng }
}
