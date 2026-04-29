import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TripList } from '@/features/trip/components/trip-list'
import { usePublicTripsQuery } from '@/features/trip/hooks'

const PAGE_SIZE = 10

export function TripsPublicPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
    }),
    [page],
  )

  const tripsQuery = usePublicTripsQuery(query)

  const onOpenTrip = (tripId: string) => {
    navigate(`/trips/${tripId}`)
  }

  return (
    <section className="panel catalog-panel">
      <header className="catalog-header">
        <h2>Public Trips</h2>
        <p>Discover public itineraries shared by other users.</p>
      </header>

      {tripsQuery.isLoading ? <p>Loading public trips...</p> : null}
      {tripsQuery.isError ? <p className="catalog-error">Failed to load public trips. Please try again.</p> : null}
      {tripsQuery.isSuccess ? (
        <TripList trips={tripsQuery.data} emptyText="No public trips found." onOpenTrip={onOpenTrip} />
      ) : null}

      <footer className="catalog-pagination">
        <button className="button" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="button"
          type="button"
          disabled={!tripsQuery.data || tripsQuery.data.length < PAGE_SIZE}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </footer>
    </section>
  )
}
