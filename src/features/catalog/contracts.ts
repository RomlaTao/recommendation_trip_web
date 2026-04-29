export type PlaceCatalogSort = 'newest' | 'rating_desc' | 'name_asc'

export type PlaceRatingBlock = {
  averageRating: number | null
  reviewCount: number
}

export type PlaceListItem = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  thumbnailUrl: string | null
  categoryId: string
  categoryName: string
  communityRating: PlaceRatingBlock
  seedRating: PlaceRatingBlock
}

export type PlaceCategory = {
  id: string
  name: string
  slug: string
  parentId: string | null
}

export type PlacesQuery = {
  q?: string
  categoryId?: string
  minRating?: number
  sort?: PlaceCatalogSort
  page?: number
  limit?: number
}

export type PaginatedPlacesResponse = {
  items: PlaceListItem[]
  total: number
  page: number
  limit: number
}
