import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { placesApi } from '@/features/places/api/places.api'
import { useCreateTrip, useDeleteTrip, useMyTrips } from '@/features/trips/hooks/useTrips'

export default function TripsRoute() {
  const navigate = useNavigate()
  const trips = useMyTrips()
  const createTrip = useCreateTrip()
  const deleteTrip = useDeleteTrip()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const destinations = useQuery({
    queryKey: ['places', 'destinations'],
    queryFn: () => placesApi.destinations(),
    staleTime: 5 * 60 * 1000,
  })

  const orderedTrips = useMemo(
    () =>
      [...(trips.data ?? [])].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    [trips.data],
  )

  return (
    <PublicSiteLayout>
      <main className="pt-24 min-h-screen bg-surface">
        <section className="max-w-container-max mx-auto px-margin-edge py-stack-lg space-y-stack-md">
          <div className="relative h-[320px] overflow-hidden rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80"
              alt="Trip cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-scrim/80 to-scrim/20 p-10 flex flex-col justify-end">
              <p className="font-label-caps text-label-caps text-on-media/70 tracking-[0.2em] uppercase">
                My Trips
              </p>
              <h1 className="font-display-xl text-display-xl text-on-media leading-tight">Design Your Signature Journeys</h1>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="font-headline-lg text-headline-lg text-primary uppercase tracking-tight">Your itineraries</h2>
            <button className="btn-home-primary" onClick={() => setIsCreateOpen(true)} type="button">Create Trip</button>
          </div>

          {trips.isError && <Alert variant="error" message="Failed to load trips." />}
          {deleteTrip.isError && <Alert variant="error" message="Failed to delete trip." />}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {trips.isLoading && (
              <div className="col-span-full text-center py-12 text-on-surface-variant">Loading trips...</div>
            )}
            {!trips.isLoading && orderedTrips.length === 0 && (
              <div className="col-span-full text-center py-12 text-on-surface-variant">
                No trips yet. Create your first trip.
              </div>
            )}

            {orderedTrips.map((trip) => (
              <div
                key={trip.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/trips/${trip.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/trips/${trip.id}`)
                  }
                }}
                className="relative text-left surface-card rounded-xl overflow-hidden hover:border-primary cursor-pointer"
              >
                <button
                  type="button"
                  aria-label={`Delete trip ${trip.title}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (deleteTrip.isPending) return
                    deleteTrip.mutate(trip.id)
                  }}
                  className="absolute top-3 right-3 z-10 inline-flex items-center justify-center size-9 rounded-full bg-surface-container-low/90 border border-outline-variant text-on-surface-variant hover:text-error hover:border-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
                <div className="h-40 bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant">travel_explore</span>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-headline-md text-primary">{trip.title}</h3>
                  <p className="text-sm text-on-surface-variant uppercase tracking-wider">
                    {trip.startDate} - {trip.endDate}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-1 rounded bg-surface-container text-on-surface-variant uppercase">
                      {trip.status}
                    </span>
                    <span className="text-on-surface-variant">{trip.days.length} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close create trip dialog"
            className="absolute inset-0 bg-scrim/50"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg surface-card space-y-4">
            <h3 className="font-headline-md text-primary uppercase">Create New Trip</h3>
            {createTrip.isError && <Alert variant="error" message="Failed to create trip." />}
            {destinations.isError && (
              <Alert variant="error" message="Failed to load destinations." />
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Trip title"
              className="w-full border border-outline-variant bg-surface-container-lowest text-on-surface px-4 py-3"
            />
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              disabled={destinations.isLoading}
              className="catalog-select"
            >
              <option value="">
                {destinations.isLoading ? 'Loading destinations…' : 'Select destination'}
              </option>
              {(destinations.data ?? [])
                .filter((d) => d.id)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
            {!destinations.isLoading &&
              !destinations.isError &&
              (destinations.data?.length ?? 0) === 0 && (
                <p className="text-sm text-on-surface-variant">
                  No destinations available. Run platform seed/migration first.
                </p>
              )}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-outline-variant bg-surface-container-lowest text-on-surface px-4 py-3"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-outline-variant bg-surface-container-lowest text-on-surface px-4 py-3"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                isLoading={createTrip.isPending}
                disabled={!title.trim() || !destinationId || !startDate || !endDate}
                onClick={() => {
                  createTrip.mutate(
                    { title: title.trim(), destinationId, startDate, endDate },
                    {
                      onSuccess: (trip) => {
                        setIsCreateOpen(false)
                        setTitle('')
                        setDestinationId('')
                        setStartDate('')
                        setEndDate('')
                        navigate(`/trips/${trip.id}`)
                      },
                    },
                  )
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </PublicSiteLayout>
  )
}
