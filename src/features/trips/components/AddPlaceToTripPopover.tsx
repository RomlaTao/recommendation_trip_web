import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMyTrips } from '@/features/trips/hooks/useTrips'
import { tripsApi } from '@/features/trips/api/trips.api'
import type { TripDay } from '@/features/trips/types/trips.types'
import { formatTripApiUserMessage } from '@/features/trips/utils/trip-api-error-message'

interface AddPlaceToTripPopoverProps {
  placeId: string
  triggerLabel?: string
  className?: string
  onDone?: () => void
}

export function AddPlaceToTripPopover({
  placeId,
  triggerLabel = 'Add To Plan',
  className,
  onDone,
}: AddPlaceToTripPopoverProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const tripsQuery = useMyTrips()
  const queryClient = useQueryClient()

  const addToTrip = useMutation({
    mutationFn: async (tripId: string) => {
      const trip = (tripsQuery.data ?? []).find((t) => t.id === tripId)
      if (!trip) throw new Error('Trip not found')

      let dayId = trip.days[0]?.id
      if (!dayId) {
        await tripsApi.addDay(trip.id, {
          dayIndex: 1,
          date: trip.startDate,
        })
        const refreshed = await tripsApi.getById(trip.id)
        dayId = refreshed.days[0]?.id
      }
      if (!dayId) throw new Error('Unable to resolve trip day')

      const currentDay =
        (trip.days.find((d) => d.id === dayId) as TripDay | undefined) ??
        (await tripsApi.getById(trip.id)).days.find((d) => d.id === dayId)
      const slot = resolveNextTimeSlot(currentDay)

      await tripsApi.addItem(trip.id, dayId, {
        placeId,
        type: 'tourist_attraction',
        startTime: slot.startTime,
        endTime: slot.endTime,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trips'] })
      setMessage('Added to trip successfully.')
      setOpen(false)
      onDone?.()
    },
    onError: (error) => {
      const ax = error as { response?: { data?: { message?: unknown } } }
      const apiMsg =
        typeof ax.response?.data?.message === 'string' ? ax.response.data.message.trim() : ''
      if (apiMsg) {
        setMessage(formatTripApiUserMessage(apiMsg))
        return
      }
      const raw = (error as Error)?.message ?? 'Failed to add place to trip.'
      if (raw.includes('409') || raw.includes('trip_item_time_overlap')) {
        setMessage(formatTripApiUserMessage('trip_item_time_overlap'))
        return
      }
      setMessage(raw)
    },
  })

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
          setMessage(null)
        }}
        className={className}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] bg-scrim/45 flex items-center justify-center px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest border border-outline-variant shadow-xl"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: '5%' }}
          >
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-headline-md text-primary uppercase">Add Place To Trip</h3>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary"
                onClick={() => setOpen(false)}
                style={{ borderRadius: '2%' }}
              >
                Close
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                Choose a trip
              </p>
              {tripsQuery.isLoading && <p className="text-sm text-on-surface-variant">Loading trips...</p>}
              {!tripsQuery.isLoading && (tripsQuery.data ?? []).length === 0 && (
                <p className="text-sm text-on-surface-variant">No trips found. Create a trip first.</p>
              )}
              <div className="max-h-72 overflow-y-auto space-y-2">
                {(tripsQuery.data ?? []).map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    disabled={addToTrip.isPending}
                    onClick={() => addToTrip.mutate(trip.id)}
                    className="w-full text-left border border-outline-variant hover:border-primary px-3 py-3"
                    style={{ borderRadius: '2%' }}
                  >
                    <p className="text-sm font-semibold text-primary line-clamp-1">{trip.title}</p>
                    <p className="text-xs text-on-surface-variant">{trip.startDate} - {trip.endDate}</p>
                  </button>
                ))}
              </div>
              {message && <p className="text-xs text-on-surface-variant">{message}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function resolveNextTimeSlot(day?: TripDay): { startTime: string; endTime: string } {
  if (!day || day.items.length === 0) {
    return { startTime: '09:00', endTime: '11:00' }
  }

  const latestEndMinutes = day.items
    .map((item) => hhmmToMinutes(item.endTime))
    .sort((a, b) => b - a)[0]

  const start = Math.min(latestEndMinutes + 30, 21 * 60)
  const end = Math.min(start + 120, 23 * 60)

  return {
    startTime: minutesToHhmm(start),
    endTime: minutesToHhmm(end),
  }
}

function hhmmToMinutes(value: string): number {
  const [hh, mm] = value.split(':').map((n) => Number(n))
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 9 * 60
  return hh * 60 + mm
}

function minutesToHhmm(minutes: number): string {
  const safe = Math.max(0, Math.min(23 * 60 + 59, minutes))
  const hh = Math.floor(safe / 60)
  const mm = safe % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
