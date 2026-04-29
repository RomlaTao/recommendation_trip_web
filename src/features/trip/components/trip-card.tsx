import type { TripResponse } from '@/features/trip/contracts'

type TripCardProps = {
  trip: TripResponse
  onOpen: (tripId: string) => void
}

export function TripCard({ trip, onOpen }: TripCardProps) {
  return (
    <article className="trip-card">
      <p className="trip-card__status">{trip.status}</p>
      <h3 className="trip-card__title">{trip.title}</h3>
      <p className="trip-card__date">
        {trip.startDate} - {trip.endDate}
      </p>
      <p className="trip-card__meta">
        {trip.days.length} day(s) | {trip.isPublic ? 'Public' : 'Private'}
      </p>
      <button className="button" type="button" onClick={() => onOpen(trip.id)}>
        View trip
      </button>
    </article>
  )
}
