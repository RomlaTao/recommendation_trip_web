import { useMemo } from 'react'

const GRID_START_HOUR = 8
const GRID_END_HOUR = 23
const PX_PER_HOUR = 64

export interface TimeGridItem {
  id: string
  placeId: string
  type: string
  startTime: string
  endTime: string
  note?: string | null
  sortOrder: number
}

export interface TimeGridDay {
  id: string
  dayIndex: number
  date: string
  items: TimeGridItem[]
}

const TYPE_ICONS: Record<string, string> = {
  restaurant: 'restaurant',
  cafe: 'local_cafe',
  hotel: 'hotel',
  tourist_attraction: 'museum',
  bar: 'nightlife',
  park: 'park',
}

const CARD_VARIANTS = [
  { wrap: 'bg-primary text-on-primary shadow-xl', timeCls: 'opacity-60' },
  {
    wrap: 'bg-primary-container text-on-primary-container shadow-lg',
    timeCls: 'opacity-60',
  },
  {
    wrap:
      'border border-primary bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary shadow-sm',
    timeCls: 'text-secondary',
  },
  {
    wrap: 'bg-secondary-container text-on-secondary-container border border-outline-variant shadow-lg',
    timeCls: 'opacity-70',
  },
] as const

function hhmmToMinutes(value: string): number {
  const [hh, mm] = value.split(':').map((n) => Number(n))
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0
  return hh * 60 + mm
}

function formatWeekdayShort(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  return d.toLocaleDateString('en-GB', { weekday: 'short' })
}

function formatDayNum(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  return String(d.getDate())
}

export interface TripItineraryTimeGridProps {
  days: TimeGridDay[]
  placeMetaMap: Map<string, { name: string; category: string }>
  overlapItemIds?: Set<string>
  invalidRangeItemIds?: Set<string>
}

export function TripItineraryTimeGrid({
  days,
  placeMetaMap,
  overlapItemIds = new Set(),
  invalidRangeItemIds = new Set(),
}: TripItineraryTimeGridProps) {
  const sortedDays = useMemo(
    () => [...days].sort((a, b) => a.dayIndex - b.dayIndex),
    [days],
  )

  const hourLabels = useMemo(() => {
    const out: number[] = []
    for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h += 1) out.push(h)
    return out
  }, [])

  const gridHeightPx = hourLabels.length * PX_PER_HOUR
  const gridStartMin = GRID_START_HOUR * 60
  const todayStr = new Date().toISOString().slice(0, 10)

  const showNowLine = sortedDays.some((d) => d.date === todayStr)
  let nowTopPx: number | null = null
  if (showNowLine) {
    const now = new Date()
    const m = now.getHours() * 60 + now.getMinutes()
    const top = ((m - gridStartMin) / 60) * PX_PER_HOUR
    if (top >= 0 && top <= gridHeightPx) nowTopPx = top
  }

  if (sortedDays.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-12 text-center text-on-surface-variant">
        Add trip days to see the calendar grid.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-outline-variant/20">
        {/* Days header — matches TripDetails_calendar.html */}
        <div
          className="grid bg-surface-container-high/50 border-b border-outline-variant/20"
          style={{
            gridTemplateColumns: `80px repeat(${sortedDays.length}, minmax(120px, 1fr))`,
          }}
        >
          <div className="p-4 md:p-6 shrink-0" />
          {sortedDays.map((day) => {
            const isToday = day.date === todayStr
            return (
              <div
                key={day.id}
                className={`p-4 md:p-6 text-center border-l border-outline-variant/10 ${
                  isToday ? 'bg-primary/5' : ''
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-widest ${
                    isToday ? 'text-primary font-bold' : 'text-secondary'
                  }`}
                >
                  {formatWeekdayShort(day.date)}
                </p>
                <p className="text-xl md:text-headline-md font-black text-primary">{formatDayNum(day.date)}</p>
                <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wide">
                  Day {day.dayIndex}
                </p>
              </div>
            )
          })}
        </div>

        <div className="relative h-[520px] md:h-[800px] overflow-y-auto overflow-x-auto">
          <div className="flex min-w-max md:min-w-0">
            {/* Time labels */}
            <div
              className="w-[80px] shrink-0 flex flex-col border-r border-outline-variant/10 bg-surface-container-lowest/80"
              style={{ minHeight: gridHeightPx }}
            >
              {hourLabels.map((h) => (
                <div
                  key={h}
                  className={`h-16 flex items-center justify-center text-[11px] text-secondary/60 ${
                    h === 12 ? 'font-bold text-primary' : ''
                  }`}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            <div className="flex flex-1 min-w-0">
              {sortedDays.map((day) => {
                const isToday = day.date === todayStr
                const sortedItems = [...day.items].sort((a, b) => a.sortOrder - b.sortOrder)

                return (
                  <div
                    key={day.id}
                    className={`flex-1 min-w-[120px] md:min-w-0 relative border-l border-outline-variant/10 ${
                      isToday ? 'bg-primary/5' : ''
                    }`}
                    style={{
                      minHeight: gridHeightPx,
                      backgroundImage: 'linear-gradient(to bottom, var(--palette-tertiary-fixed) 1px, transparent 1px)',
                      backgroundSize: `100% ${PX_PER_HOUR}px`,
                    }}
                  >
                    {sortedItems.map((item, itemIdx) => {
                      const placeMeta = placeMetaMap.get(item.placeId)
                      const title = placeMeta?.name ?? `Place ${item.placeId.slice(0, 8)}`
                      const category = placeMeta?.category ?? item.type
                      const icon = TYPE_ICONS[item.type] ?? 'place'
                      const startMin = hhmmToMinutes(item.startTime)
                      const endMin = hhmmToMinutes(item.endTime)
                      const durMin = Math.max(endMin - startMin, 15)
                      let top = ((startMin - gridStartMin) / 60) * PX_PER_HOUR
                      let height = (durMin / 60) * PX_PER_HOUR
                      top = Math.max(0, Math.min(top, gridHeightPx - 16))
                      height = Math.max(height, 48)
                      height = Math.min(height, gridHeightPx - top)

                      const hasIssue = overlapItemIds.has(item.id) || invalidRangeItemIds.has(item.id)
                      const v = CARD_VARIANTS[itemIdx % CARD_VARIANTS.length]

                      return (
                        <div
                          key={item.id}
                          className={`absolute left-2 right-2 p-3 md:p-4 rounded-lg z-20 flex flex-col justify-between transition-transform hover:scale-[1.02] ${
                            hasIssue
                              ? 'bg-error-container border border-error text-on-error-container'
                              : v.wrap
                          }`}
                          style={{ top, height, marginLeft: 4, marginRight: 4 }}
                          title={`${item.startTime} — ${item.endTime}`}
                        >
                          <div>
                            <p
                              className={`text-[11px] font-bold uppercase tracking-tighter ${
                                hasIssue ? 'opacity-90' : v.timeCls
                              }`}
                            >
                              {item.startTime} — {item.endTime}
                            </p>
                            <h3 className="text-sm font-bold leading-tight mt-0.5 line-clamp-2">{title}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 min-h-0">
                            <span className="material-symbols-outlined text-[14px] shrink-0">{icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest truncate">
                              {category}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {nowTopPx != null && (
            <div
              className="absolute left-0 right-0 h-px bg-error z-30 pointer-events-none"
              style={{ top: nowTopPx }}
            >
              <div className="absolute left-[80px] -translate-y-1/2 w-2 h-2 rounded-full bg-error" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
