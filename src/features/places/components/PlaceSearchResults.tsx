import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PaginatedPlaces } from '@/features/places/types/places.types'
import { AddPlaceToTripPopover } from '@/features/trips/components/AddPlaceToTripPopover'

interface Props {
  data?: PaginatedPlaces
  loading: boolean
  onPrevPage: () => void
  onNextPage: () => void
}

const PLACE_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=900&q=80'

export function PlaceSearchResults({ data, loading, onPrevPage, onNextPage }: Props) {
  const navigate = useNavigate()
  const [favourites, setFavourites] = useState<Record<string, boolean>>({})

  function toggleFavourite(placeId: string) {
    setFavourites((prev) => ({ ...prev, [placeId]: !prev[placeId] }))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest border border-outline-variant overflow-hidden rounded-2xl animate-pulse"
          >
            <div className="aspect-[4/3] bg-surface-container" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-surface-container rounded-full w-2/3" />
              <div className="h-3 bg-surface-container rounded-full w-1/2" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="h-9 bg-surface-container rounded-xl" />
                <div className="h-9 bg-surface-container rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl text-outline-variant block mb-3">
          location_off
        </span>
        No places found. Try adjusting your filters.
      </div>
    )
  }

  const canPrev = data.page > 1
  const canNext = data.page * data.limit < data.total

  return (
    <div className="space-y-6">
      <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.15em] border-b border-outline-variant pb-2">
        {data.total} place{data.total !== 1 ? 's' : ''} found
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.items.map((place) => (
          <div
            key={place.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/places/${place.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`/places/${place.id}`)
              }
            }}
            className="group relative bg-surface-container-lowest border border-outline-variant overflow-hidden hover:border-primary transition-all duration-300 rounded-2xl cursor-pointer"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
              {place.thumbnailUrl ? (
                <img
                  src={place.thumbnailUrl}
                  alt={place.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const img = e.currentTarget
                    if (img.src !== PLACE_IMAGE_FALLBACK) {
                      img.src = PLACE_IMAGE_FALLBACK
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline-variant">
                  <span className="material-symbols-outlined text-4xl">image</span>
                </div>
              )}

              <button
                type="button"
                aria-label="Toggle favourite"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavourite(place.id)
                }}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-on-media/90 backdrop-blur flex items-center justify-center hover:bg-on-media transition-colors"
              >
                <span
                  className="material-symbols-outlined text-[18px] text-primary"
                  style={{ fontVariationSettings: favourites[place.id] ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>

              {place.categoryName && (
                <span className="absolute bottom-3 left-3 bg-scrim/80 text-on-media font-label-caps text-[10px] tracking-wider px-2 py-1 uppercase rounded">
                  {place.categoryName.replaceAll('_', ' ')}
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              {(() => {
                const effectiveAverage =
                  place.communityRating.averageRating ?? place.seedRating.averageRating
                const effectiveReviewCount =
                  place.communityRating.reviewCount > 0
                    ? place.communityRating.reviewCount
                    : place.seedRating.reviewCount

                return (
                  <>
                    <div>
                      <h4 className="font-headline-md text-[20px] text-on-surface tracking-tight line-clamp-1">
                        {place.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span>{effectiveAverage?.toFixed(1) ?? 'N/A'}</span>
                        <span className="text-xs">({effectiveReviewCount} Reviews)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/places/${place.id}`)
                        }}
                        className="py-2 border border-outline-variant hover:border-primary text-primary font-label-caps text-[10px] tracking-widest uppercase transition-colors rounded-xl whitespace-nowrap text-center"
                      >
                        Details
                      </button>
                      <AddPlaceToTripPopover
                        placeId={place.id}
                        className="w-full py-2 bg-primary text-on-primary font-label-caps text-[10px] tracking-widest uppercase hover:bg-primary-strong transition-colors rounded-xl whitespace-nowrap"
                      />
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
        <p className="text-sm text-on-surface-variant">
          Page {data.page} · {data.total} total
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!canPrev}
            className="px-5 py-2 border border-outline-variant font-label-caps text-[11px] tracking-widest uppercase text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canNext}
            className="px-5 py-2 border border-outline-variant font-label-caps text-[11px] tracking-widest uppercase text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
