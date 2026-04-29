import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useBeforeUnload, useBlocker } from 'react-router-dom'

import { TripBuilderBoard } from '@/features/trip/components/trip-builder-board'
import {
  useAddTripItemMutation,
  useRemoveTripItemMutation,
  useTripDetailQuery,
  useUpdateTripDayMutation,
  useUpdateTripItemMutation,
} from '@/features/trip/hooks'
import { useTripDraftStore } from '@/features/trip/store'

export function TripDetailPage() {
  const { tripId } = useParams()
  const tripDetailQuery = useTripDetailQuery(tripId)
  const initializeDraft = useTripDraftStore((state) => state.initializeDraft)
  const consumeOperations = useTripDraftStore((state) => state.consumeOperations)
  const isDirty = useTripDraftStore((state) => state.isDirty)
  const markPersistSuccess = useTripDraftStore((state) => state.markPersistSuccess)
  const resetToServerTrip = useTripDraftStore((state) => state.resetToServerTrip)
  const operationsCount = useTripDraftStore((state) => state.operations.length)
  const updateDayMutation = useUpdateTripDayMutation()
  const addItemMutation = useAddTripItemMutation()
  const updateItemMutation = useUpdateTripItemMutation()
  const removeItemMutation = useRemoveTripItemMutation()
  const isSyncingRef = useRef(false)

  const blocker = useBlocker(isDirty)

  useBeforeUnload((event) => {
    if (!isDirty) {
      return
    }
    event.preventDefault()
    event.returnValue = ''
  })

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return
    }

    const confirmed = window.confirm('You have unsaved trip builder changes. Leave this page?')
    if (confirmed) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  useEffect(() => {
    if (tripDetailQuery.data) {
      initializeDraft(tripDetailQuery.data)
    }
  }, [initializeDraft, tripDetailQuery.data])

  useEffect(() => {
    if (!tripId || operationsCount === 0 || isSyncingRef.current) {
      return
    }

    const timeoutId = window.setTimeout(async () => {
      if (isSyncingRef.current) {
        return
      }

      isSyncingRef.current = true
      const operations = consumeOperations()

      try {
        for (const operation of operations) {
          if (operation.type === 'updateDay') {
            await updateDayMutation.mutateAsync({
              tripId,
              dayId: operation.dayId,
              payload: operation.payload,
            })
          }
          if (operation.type === 'addItem') {
            await addItemMutation.mutateAsync({
              tripId,
              dayId: operation.dayId,
              payload: operation.payload,
            })
          }
          if (operation.type === 'updateItem') {
            await updateItemMutation.mutateAsync({
              tripId,
              dayId: operation.dayId,
              itemId: operation.itemId,
              payload: operation.payload,
            })
          }
          if (operation.type === 'removeItem') {
            await removeItemMutation.mutateAsync({
              tripId,
              dayId: operation.dayId,
              itemId: operation.itemId,
            })
          }
        }

        await tripDetailQuery.refetch()
        markPersistSuccess()
      } catch {
        const latest = await tripDetailQuery.refetch()
        if (latest.data) {
          resetToServerTrip(latest.data)
        }
      } finally {
        isSyncingRef.current = false
      }
    }, 600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    addItemMutation,
    consumeOperations,
    markPersistSuccess,
    operationsCount,
    removeItemMutation,
    resetToServerTrip,
    tripDetailQuery,
    tripId,
    updateDayMutation,
    updateItemMutation,
  ])

  return (
    <section className="panel catalog-panel">
      <h2>Trip Detail</h2>
      {tripDetailQuery.isLoading ? <p>Loading trip detail...</p> : null}
      {tripDetailQuery.isError ? <p className="catalog-error">Failed to load trip detail.</p> : null}
      {tripDetailQuery.isSuccess ? (
        <>
          {isDirty ? <p className="catalog-warning">Unsaved changes. Syncing automatically...</p> : null}
          <TripBuilderBoard />
        </>
      ) : null}
    </section>
  )
}
