import type { TripDraftItem } from '@/features/trip/contracts'

type TripItemCardProps = {
  item: TripDraftItem
  dayId: string
  onDragStart: (itemId: string, dayId: string) => void
}

export function TripItemCard({ item, dayId, onDragStart }: TripItemCardProps) {
  return (
    <article
      className="trip-builder-item"
      draggable
      onDragStart={() => onDragStart(item.id, dayId)}
      title="Drag to reorder or move to another day"
    >
      <p className="trip-builder-item__type">{item.type}</p>
      <p className="trip-builder-item__time">
        {item.startTime} - {item.endTime}
      </p>
      <p className="trip-builder-item__meta">placeId: {item.placeId}</p>
      {item.note ? <p className="trip-builder-item__note">note: {item.note}</p> : null}
    </article>
  )
}
