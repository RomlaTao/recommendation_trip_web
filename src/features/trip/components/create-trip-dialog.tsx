import { useMemo, useState, type FormEvent } from 'react'

import type { CreateTripPayload } from '@/features/trip/contracts'

type CreateTripDialogProps = {
  isSubmitting: boolean
  onSubmit: (payload: CreateTripPayload) => Promise<void>
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function createDays(startDate: string, daysCount: number) {
  const start = new Date(startDate)
  return Array.from({ length: daysCount }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      dayIndex: index + 1,
      date: toISODate(date),
      items: [],
    }
  })
}

export function CreateTripDialog({ isSubmitting, onSubmit }: CreateTripDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [daysCount, setDaysCount] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const endDate = useMemo(() => {
    if (!startDate) {
      return ''
    }

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + daysCount - 1)
    return toISODate(end)
  }, [daysCount, startDate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!title.trim() || !startDate || daysCount < 1) {
      setError('Please fill title, start date, and number of days.')
      return
    }

    try {
      await onSubmit({
        title: title.trim(),
        startDate,
        endDate,
        days: createDays(startDate, daysCount),
      })
      setIsOpen(false)
      setTitle('')
      setStartDate('')
      setDaysCount(1)
    } catch {
      setError('Failed to create trip. Please try again.')
    }
  }

  return (
    <div className="create-trip-dialog">
      <button className="button" type="button" onClick={() => setIsOpen((current) => !current)}>
        {isOpen ? 'Close' : 'Create New Trip'}
      </button>

      {isOpen ? (
        <form className="create-trip-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Trip title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Da Lat 3D2N" />
          </label>

          <label className="auth-field">
            <span>Start date</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>

          <label className="auth-field">
            <span>Number of days</span>
            <input
              type="number"
              min={1}
              max={30}
              value={daysCount}
              onChange={(event) => setDaysCount(Number(event.target.value) || 1)}
            />
          </label>

          {error ? <p className="catalog-error">{error}</p> : null}
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create draft trip'}
          </button>
        </form>
      ) : null}
    </div>
  )
}
