import type { DragEvent } from 'react'

import { TripItemCard } from '@/features/trip/components/trip-item-card'
import type { TripDraftDay } from '@/features/trip/contracts'

type TripDayColumnProps = {
  day: TripDraftDay
  onDragStartItem: (itemId: string, dayId: string) => void
  onDropItem: (dayId: string, index: number) => void
}

export function TripDayColumn({ day, onDragStartItem, onDropItem }: TripDayColumnProps) {
  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <section className="trip-builder-day" onDragOver={onDragOver} onDrop={() => onDropItem(day.id, day.items.length)}>
      <header className="trip-builder-day__header">
        <h3>
          Day {day.dayIndex}
        </h3>
        <span>{day.date}</span>
      </header>

      <div className="trip-builder-day__items">
        {day.items.length === 0 ? <p className="trip-day-empty">Drop item here.</p> : null}
        {day.items.map((item, index) => (
          <div key={item.id} onDragOver={onDragOver} onDrop={() => onDropItem(day.id, index)}>
            <TripItemCard item={item} dayId={day.id} onDragStart={onDragStartItem} />
          </div>
        ))}
      </div>
    </section>
  )
}
