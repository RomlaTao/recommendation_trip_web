import { TripCard } from '@/features/trip/components/trip-card'
import type { TripResponse } from '@/features/trip/contracts'

type TripListProps = {
  trips: TripResponse[]
  emptyText: string
  onOpenTrip: (tripId: string) => void
}

export function TripList({ trips, emptyText, onOpenTrip }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="catalog-empty">
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="trip-grid">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} onOpen={onOpenTrip} />
      ))}
    </div>
  )
}
