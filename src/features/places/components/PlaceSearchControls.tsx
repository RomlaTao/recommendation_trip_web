import type { PlaceCategory, PlaceSort } from '@/features/places/types/places.types'

interface Props {
  keyword: string
  selectedCategory?: string
  minRating?: number
  sort: PlaceSort
  categories: PlaceCategory[]
  onKeywordChange: (value: string) => void
  onCategoryChange: (value?: string) => void
  onMinRatingChange: (value?: number) => void
  onSortChange: (value: PlaceSort) => void
  onReset: () => void
}

export function PlaceSearchControls({
  keyword,
  selectedCategory,
  minRating,
  sort,
  categories,
  onKeywordChange,
  onCategoryChange,
  onMinRatingChange,
  onSortChange,
  onReset,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Search input — matches Searching.html sidebar search bar */}
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary text-[20px]">
          search
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search by name or neighbourhood..."
          className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-0 rounded-3xl font-body-md placeholder:text-on-surface-variant/60 focus:outline-none transition-colors"
        />
      </div>

      {/* Category filter chips — matches Searching.html rounded-full pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange(undefined)}
          className={`px-5 py-2 font-label-caps text-[11px] tracking-[0.1em] uppercase transition-all rounded-full ${
            !selectedCategory
              ? 'bg-primary text-on-primary'
              : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCategoryChange(c.id)}
            className={`px-5 py-2 font-label-caps text-[11px] tracking-[0.1em] uppercase transition-all rounded-full ${
              selectedCategory === c.id
                ? 'bg-primary text-on-primary'
                : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Rating + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {([undefined, 4, 4.5] as const).map((r) => (
            <button
              key={String(r)}
              type="button"
              onClick={() => onMinRatingChange(r)}
              className={`px-4 py-1.5 font-label-caps text-[11px] tracking-[0.1em] uppercase transition-all rounded-full ${
                minRating === r
                  ? 'bg-primary text-on-primary'
                  : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {r === undefined ? 'Any rating' : `${r}+`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {(
            [
              { label: 'Newest', value: 'newest' },
              { label: 'Top Rated', value: 'rating_desc' },
              { label: 'Name A–Z', value: 'name_asc' },
            ] as { label: string; value: PlaceSort }[]
          ).map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSortChange(s.value)}
              className={`px-4 py-1.5 font-label-caps text-[11px] tracking-[0.1em] uppercase transition-all rounded-full ${
                sort === s.value
                  ? 'bg-primary text-on-primary'
                  : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-1.5 font-label-caps text-[11px] tracking-[0.1em] uppercase transition-all rounded-full border border-outline-variant text-on-surface-variant hover:border-error hover:text-error"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
