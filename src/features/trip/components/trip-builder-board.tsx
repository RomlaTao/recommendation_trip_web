import { useMemo } from 'react'

import { TripDayColumn } from '@/features/trip/components/trip-day-column'
import { useTripDraftStore } from '@/features/trip/store'

export function TripBuilderBoard() {
  const draft = useTripDraftStore((state) => state.draft)
  const startDragItem = useTripDraftStore((state) => state.startDragItem)
  const dropItemToDay = useTripDraftStore((state) => state.dropItemToDay)
  const reorderDays = useTripDraftStore((state) => state.reorderDays)

  const orderedDays = useMemo(() => {
    return [...(draft?.days ?? [])].sort((a, b) => a.dayIndex - b.dayIndex)
  }, [draft?.days])

  if (!draft) {
    return null
  }

  const moveDay = (sourceIndex: number, direction: -1 | 1) => {
    const targetIndex = sourceIndex + direction
    if (targetIndex < 0 || targetIndex >= orderedDays.length) {
      return
    }

    const next = [...orderedDays]
    const [day] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, day)
    reorderDays(next.map((item) => item.id))
  }

  return (
    <div className="trip-builder">
      <header className="trip-builder__header">
        <h2>{draft.title}</h2>
        <p>
          {draft.startDate} - {draft.endDate}
        </p>
      </header>
      <div className="trip-builder__days">
        {orderedDays.map((day, index) => (
          <div key={day.id} className="trip-builder-day-wrap">
            <div className="trip-builder-day-actions">
              <button className="button" type="button" onClick={() => moveDay(index, -1)} disabled={index === 0}>
                Move day left
              </button>
              <button
                className="button"
                type="button"
                onClick={() => moveDay(index, 1)}
                disabled={index === orderedDays.length - 1}
              >
                Move day right
              </button>
            </div>
            <TripDayColumn day={day} onDragStartItem={startDragItem} onDropItem={dropItemToDay} />
          </div>
        ))}
      </div>
    </div>
  )
}
