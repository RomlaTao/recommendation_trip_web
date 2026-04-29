import { useMemo, useState, type FormEvent } from 'react'

import { PlaceList } from '@/features/catalog/components/place-list'
import { usePlaceCategoriesQuery, usePlacesQuery } from '@/features/catalog/hooks'

const PAGE_SIZE = 12

export function PlacesExplorePage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)

  const query = useMemo(
    () => ({
      q: search || undefined,
      categoryId: categoryId || undefined,
      page,
      limit: PAGE_SIZE,
      sort: 'newest' as const,
    }),
    [categoryId, page, search],
  )

  const placesQuery = usePlacesQuery(query)
  const categoriesQuery = usePlaceCategoriesQuery()

  const totalPages = placesQuery.data ? Math.max(1, Math.ceil(placesQuery.data.total / placesQuery.data.limit)) : 1

  const onApplySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
  }

  const onCategoryChange = (value: string) => {
    setCategoryId(value)
    setPage(1)
  }

  return (
    <section className="panel catalog-panel">
      <header className="catalog-header">
        <h2>Explore Places</h2>
        <p>Browse approved places and prepare materials for your trip planning.</p>
      </header>

      <form className="catalog-filters" onSubmit={onApplySearch}>
        <input
          className="catalog-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search places by name or keyword"
        />

        <select
          className="catalog-select"
          value={categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          disabled={categoriesQuery.isLoading}
        >
          <option value="">All categories</option>
          {(categoriesQuery.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button className="button" type="submit">
          Apply
        </button>
      </form>

      {placesQuery.isLoading ? <p>Loading places...</p> : null}
      {placesQuery.isError ? <p>Failed to load places. Please try again.</p> : null}
      {placesQuery.isSuccess ? <PlaceList places={placesQuery.data.items} /> : null}

      <footer className="catalog-pagination">
        <button
          className="button"
          type="button"
          disabled={page <= 1 || placesQuery.isLoading}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          className="button"
          type="button"
          disabled={page >= totalPages || placesQuery.isLoading}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          Next
        </button>
      </footer>
    </section>
  )
}
