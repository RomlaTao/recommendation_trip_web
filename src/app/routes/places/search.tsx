import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { PlaceSearchControls } from '@/features/places/components/PlaceSearchControls'
import { PlaceSearchResults } from '@/features/places/components/PlaceSearchResults'
import { usePlaceSearch } from '@/features/places/hooks/usePlaceSearch'

export default function PlacesSearchRoute() {
  const [searchParams] = useSearchParams()
  const queryFromUrl = searchParams.get('q')?.trim() ?? ''
  const {
    state,
    placesQuery,
    categoriesQuery,
    nearbyQuery,
    setKeyword,
    setCategory,
    setMinRating,
    setSort,
    setPage,
    resetFilters,
    fetchNearby,
  } = usePlaceSearch(queryFromUrl)

  useEffect(() => {
    setKeyword(queryFromUrl)
    // Sync only when URL query changes; avoid resetting local typing loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFromUrl])

  return (
    <PublicSiteLayout showConcierge>
      <div className="space-y-0 pt-24 min-h-screen">
        <section className="h-72 bg-primary text-on-media flex items-end">
          <div className="max-w-screen-xl mx-auto w-full px-gutter pb-10">
            <h1 className="text-5xl font-extrabold tracking-tight uppercase">Searching Places</h1>
            <p className="mt-2 text-on-media/80">Find and curate places for your next trip.</p>
          </div>
        </section>

        <section className="max-w-screen-xl mx-auto px-gutter py-8 space-y-4">
          <PlaceSearchControls
            keyword={state.q}
            selectedCategory={state.categoryId}
            minRating={state.minRating}
            sort={state.sort}
            categories={categoriesQuery.data ?? []}
            onKeywordChange={setKeyword}
            onCategoryChange={setCategory}
            onMinRatingChange={setMinRating}
            onSortChange={setSort}
            onReset={resetFilters}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-on-surface">Results</h2>
            <button
              type="button"
              onClick={() => fetchNearby()}
              className="px-4 py-2 border border-outline text-sm hover:bg-surface-container"
            >
              Load nearby
            </button>
          </div>

          {placesQuery.isError && <Alert variant="error" message="Failed to load places." />}
          {nearbyQuery.data && nearbyQuery.data.length > 0 && (
            <Alert variant="info" message={`Nearby found: ${nearbyQuery.data.length} places`} />
          )}

          <PlaceSearchResults
            data={placesQuery.data}
            loading={placesQuery.isLoading}
            onPrevPage={() => setPage(Math.max(1, state.page - 1))}
            onNextPage={() => setPage(state.page + 1)}
          />
        </section>
      </div>
    </PublicSiteLayout>
  )
}
