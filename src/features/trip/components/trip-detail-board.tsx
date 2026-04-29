import type { TripResponse } from '@/features/trip/contracts'

type TripDetailBoardProps = {
  trip: TripResponse
}

export function TripDetailBoard({ trip }: TripDetailBoardProps) {
  return (
    <div className="trip-detail">
      <header>
        <h2>{trip.title}</h2>
        <p>
          {trip.startDate} - {trip.endDate} | {trip.status} | {trip.isPublic ? 'Public' : 'Private'}
        </p>
      </header>

      <div className="trip-days">
        {trip.days.map((day) => (
          <article key={day.id} className="trip-day-card">
            <h3>
              Day {day.dayIndex} - {day.date}
            </h3>
            {day.items.length === 0 ? (
              <p className="trip-day-empty">No activities yet for this day.</p>
            ) : (
              <ul className="trip-item-list">
                {day.items.map((item) => (
                  <li key={item.id}>
                    <strong>{item.type}</strong> ({item.startTime}-{item.endTime}) | placeId: {item.placeId}
                    {item.note ? ` | note: ${item.note}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
