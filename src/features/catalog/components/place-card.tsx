import type { PlaceListItem } from '@/features/catalog/contracts'

type PlaceCardProps = {
  place: PlaceListItem
}

function formatRating(value: number | null): string {
  return value === null ? 'N/A' : value.toFixed(1)
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <article className="place-card">
      <div className="place-card__media">
        {place.thumbnailUrl ? (
          <img className="place-card__image" src={place.thumbnailUrl} alt={place.name} />
        ) : (
          <div className="place-card__placeholder">No image</div>
        )}
      </div>
      <div className="place-card__body">
        <p className="place-card__category">{place.categoryName}</p>
        <h3 className="place-card__title">{place.name}</h3>
        <p className="place-card__address">{place.address}</p>
        <div className="place-card__ratings">
          <span>Community {formatRating(place.communityRating.averageRating)}</span>
          <span>Seed {formatRating(place.seedRating.averageRating)}</span>
        </div>
      </div>
    </article>
  )
}
