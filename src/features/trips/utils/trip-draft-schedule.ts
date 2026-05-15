import type { TimeGridDay, TimeGridItem } from '@/features/trips/components/TripItineraryTimeGrid'

function hhmmToMinutes(value: string): number {
  const [hh, mm] = value.split(':').map((n) => Number(n))
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0
  return hh * 60 + mm
}

function resortDayItems(items: TimeGridItem[]): TimeGridItem[] {
  return [...items]
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime) || a.id.localeCompare(b.id))
    .map((it, idx) => ({ ...it, sortOrder: idx + 1 }))
}

/** Move/update one item’s calendar slot (same logic list vs FullCalendar must share). */
export function applyTripItemSchedule(
  prev: TimeGridDay[],
  itemId: string,
  targetDateYmd: string,
  startTime: string,
  endTime: string,
): TimeGridDay[] {
  const allowed = new Set(prev.map((d) => d.date))
  if (!allowed.has(targetDateYmd)) return prev

  let moving: TimeGridItem | null = null
  let sourceDateYmd: string | null = null
  for (const d of prev) {
    const found = d.items.find((it) => it.id === itemId)
    if (found) {
      moving = { ...found }
      sourceDateYmd = d.date
      break
    }
  }
  if (!moving || !sourceDateYmd) return prev

  const stripped = prev.map((d) => ({
    ...d,
    items: d.items.filter((it) => it.id !== itemId),
  }))

  const inserted = stripped.map((d) => {
    if (d.date !== targetDateYmd) return d
    return { ...d, items: [...d.items, { ...moving, startTime, endTime }] }
  })

  const touchedDays = new Set<string>([sourceDateYmd, targetDateYmd])

  return inserted.map((d) => {
    if (!touchedDays.has(d.date)) return d
    return { ...d, items: resortDayItems(d.items) }
  })
}
