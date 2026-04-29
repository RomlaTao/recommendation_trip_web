import { PlaceCard } from '@/features/catalog/components/place-card'
import type { PlaceListItem } from '@/features/catalog/contracts'

type PlaceListProps = {
  places: PlaceListItem[]
}

export function PlaceList({ places }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="catalog-empty">
        <p>No places found for current filters.</p>
      </div>
    )
  }

  return (
    <div className="place-grid">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  )
}
