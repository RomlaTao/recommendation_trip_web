import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CreateTripDialog } from '@/features/trip/components/create-trip-dialog'
import type { CreateTripPayload } from '@/features/trip/contracts'
import { TripList } from '@/features/trip/components/trip-list'
import { useCreateTripMutation, useMyTripsQuery } from '@/features/trip/hooks'

const PAGE_SIZE = 10

export function TripsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
    }),
    [page],
  )

  const tripsQuery = useMyTripsQuery(query)
  const createTripMutation = useCreateTripMutation()

  const onOpenTrip = (tripId: string) => {
    navigate(`/trips/${tripId}`)
  }

  const onCreateTrip = async (payload: CreateTripPayload) => {
    const created = await createTripMutation.mutateAsync(payload)
    navigate(`/trips/${created.id}`)
  }

  return (
    <section className="panel catalog-panel">
      <header className="catalog-header">
        <h2>My Trips</h2>
        <p>Manage your draft and published trips.</p>
      </header>

      <CreateTripDialog isSubmitting={createTripMutation.isPending} onSubmit={onCreateTrip} />

      {tripsQuery.isLoading ? <p>Loading your trips...</p> : null}
      {tripsQuery.isError ? <p className="catalog-error">Failed to load trips. Please try again.</p> : null}
      {tripsQuery.isSuccess ? (
        <TripList trips={tripsQuery.data} emptyText="No trips yet. Create your first draft trip." onOpenTrip={onOpenTrip} />
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
