import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import type { EventChangeArg, EventInput } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'

import type { TimeGridDay } from '@/features/trips/components/TripItineraryTimeGrid'
import { applyTripItemSchedule } from '@/features/trips/utils/trip-draft-schedule'

function hhmmToMinutes(value: string): number {
  const [hh, mm] = value.split(':').map((n) => Number(n))
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0
  return hh * 60 + mm
}

/** Local wall-clock instant from trip day + HH:mm (same convention as list view). */
function localDateFromDayAndHhmm(dayDate: string, hhmm: string): Date {
  const [y, mo, d] = dayDate.split('-').map(Number)
  const timePart = hhmm.slice(0, 5)
  const [h, m] = timePart.split(':').map(Number)
  return new Date(y, mo - 1, d, h, m, 0, 0)
}

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

function formatLocalHhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function diffDaysInclusive(isoA: string, isoB: string): number {
  const d1 = new Date(`${isoA}T12:00:00`)
  const d2 = new Date(`${isoB}T12:00:00`)
  return Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1
}

export interface TripFullCalendarProps {
  days: TimeGridDay[]
  placeMetaMap: Map<string, { name: string; category: string }>
  overlapItemIds?: Set<string>
  invalidRangeItemIds?: Set<string>
  onDraftChange: (updater: (prev: TimeGridDay[]) => TimeGridDay[]) => void
}

export function TripFullCalendar({
  days,
  placeMetaMap,
  overlapItemIds = new Set(),
  invalidRangeItemIds = new Set(),
  onDraftChange,
}: TripFullCalendarProps) {
  const sortedDays = useMemo(
    () => [...days].sort((a, b) => a.dayIndex - b.dayIndex),
    [days],
  )

  const allowedDateSet = useMemo(() => new Set(days.map((d) => d.date)), [days])

  const { rangeStart, span } = useMemo(() => {
    if (!sortedDays.length) {
      const t = new Date()
      const y = t.getFullYear()
      const m = String(t.getMonth() + 1).padStart(2, '0')
      const d = String(t.getDate()).padStart(2, '0')
      return { rangeStart: `${y}-${m}-${d}`, span: 1 }
    }
    const ds = [...sortedDays.map((x) => x.date)].sort()
    const start = ds[0]
    const end = ds[ds.length - 1]
    const rawSpan = diffDaysInclusive(start, end)
    return { rangeStart: start, span: Math.min(31, Math.max(1, rawSpan)) }
  }, [sortedDays])

  const calendarPlugins = useMemo(() => [timeGridPlugin, interactionPlugin], [])

  const events: EventInput[] = useMemo(() => {
    const out: EventInput[] = []
    for (const day of sortedDays) {
      for (const item of day.items) {
        const meta = placeMetaMap.get(item.placeId)
        const title = meta?.name ?? `Place ${item.placeId.slice(0, 8)}`
        const start = localDateFromDayAndHhmm(day.date, item.startTime)
        const end = localDateFromDayAndHhmm(day.date, item.endTime)
        if (end <= start) continue
        out.push({
          id: item.id,
          title,
          start,
          end,
          allDay: false,
          extendedProps: {
            category: meta?.category ?? item.type,
            type: item.type,
          },
        })
      }
    }
    return out
  }, [sortedDays, placeMetaMap])

  function commitFromCalendarInteraction(info: EventChangeArg) {
    const { event, revert } = info
    const start = event.start
    const end = event.end
    if (!start || !end) {
      revert()
      return
    }
    const dateYmd = formatLocalYmd(start)
    if (formatLocalYmd(end) !== dateYmd) {
      revert()
      return
    }
    if (!allowedDateSet.has(dateYmd)) {
      revert()
      return
    }
    const st = formatLocalHhmm(start)
    const et = formatLocalHhmm(end)
    if (hhmmToMinutes(st) >= hhmmToMinutes(et)) {
      revert()
      return
    }
    onDraftChange((prev) => applyTripItemSchedule(prev, event.id, dateYmd, st, et))
  }

  if (sortedDays.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-12 text-center text-on-surface-variant">
        Add trip days to see the calendar.
      </div>
    )
  }

  return (
    <div className="trip-fullcalendar rounded-xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden [&_.fc]:font-sans [&_.fc-scrollgrid]:border-outline-variant/40 [&_.fc-theme-standard_td]:border-outline-variant/30 [&_.fc-theme-standard_th]:border-outline-variant/30 [&_.fc-col-header-cell]:bg-surface-container-high/50 [&_.fc-timegrid-slot]:border-outline-variant/15 [&_.fc-timegrid-axis]:text-secondary [&_.fc-toolbar-title]:text-primary [&_.fc-toolbar-title]:font-bold [&_.fc-button]:bg-primary [&_.fc-button]:border-primary [&_.fc-button]:text-on-primary [&_.fc-button:hover]:opacity-90 [&_.fc-event]:rounded-lg [&_.fc-event]:border-none [&_.fc-event-title]:font-bold [&_.fc-event-time]:opacity-80 [&_.fc-now-indicator-line]:border-error [&_.fc-now-indicator-arrow]:border-error">
      <FullCalendar
        key={`fc-${rangeStart}-${span}-${sortedDays.map((d) => d.id).join('-')}`}
        plugins={calendarPlugins}
        initialView="tripDuration"
        initialDate={rangeStart}
        views={{
          tripDuration: {
            type: 'timeGrid',
            duration: { days: span },
          },
        }}
        headerToolbar={{
          left: 'title',
          center: '',
          right: 'prev,next',
        }}
        height={720}
        editable
        selectable={false}
        eventStartEditable
        eventDurationEditable
        eventOverlap
        snapDuration="00:05:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        slotMinTime="06:00:00"
        slotMaxTime="23:59:59"
        scrollTime="06:00:00"
        firstDay={1}
        dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
        events={events}
        eventDrop={commitFromCalendarInteraction}
        eventResize={commitFromCalendarInteraction}
        eventClassNames={(arg) => {
          const id = arg.event.id
          const cls: string[] = []
          if (overlapItemIds.has(id)) cls.push('!bg-error-container !text-on-error-container ring-2 ring-error')
          else if (invalidRangeItemIds.has(id)) cls.push('!bg-error-container !text-on-error-container ring-2 ring-error')
          else cls.push('!bg-primary !text-on-primary')
          return cls
        }}
        eventContent={(arg) => (
          <div className="fc-event-main-frame flex flex-col gap-0.5 px-1 py-0.5 overflow-hidden">
            <div className="fc-event-time text-[10px] uppercase tracking-tighter">{arg.timeText}</div>
            <div className="fc-event-title font-bold text-xs leading-tight line-clamp-2">{arg.event.title}</div>
            {arg.event.extendedProps.category ? (
              <div className="text-[9px] font-bold uppercase tracking-widest truncate opacity-90">
                {String(arg.event.extendedProps.category)}
              </div>
            ) : null}
          </div>
        )}
      />
    </div>
  )
}
