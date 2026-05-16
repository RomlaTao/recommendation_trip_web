export type PlaceSort = 'newest' | 'rating_desc' | 'name_asc'

export interface PlaceRatingBlock {
  averageRating: number | null
  reviewCount: number
}

export interface PlaceListItem {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  thumbnailUrl: string | null
  categoryId: string | null
  categoryName: string | null
  destination: PlaceDestination | null
  communityRating: PlaceRatingBlock
  seedRating: PlaceRatingBlock
}

export interface PlaceDetail extends PlaceListItem {
  description: string | null
  imageUrls: string[] | null
}

export interface NearbyPlace extends PlaceListItem {
  distanceInMeters: number
}

export interface PlaceCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
}

/** Catalog region / destination (matches backend `destinations` table). */
export interface PlaceDestination {
  id: string
  slug: string
  name: string
}

export interface PaginatedPlaces {
  items: PlaceListItem[]
  total: number
  page: number
  limit: number
}

export interface SearchPlacesParams {
  q?: string
  categoryId?: string
  destinationId?: string
  minRating?: number
  sort?: PlaceSort
  page?: number
  limit?: number
}

export interface NearbyPlacesParams {
  lat: number
  lng: number
  radiusInMeters?: number
  limit?: number
}

export interface PlaceReview {
  id: string
  placeId: string
  userId: string
  rating: number
  comment?: string | null
  imageUrls?: string[] | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedPlaceReviews {
  items: PlaceReview[]
  total: number
  page: number
  limit: number
}

export interface UpsertPlaceReviewDto {
  rating: number
  comment?: string
  imageUrls?: string[]
}

export interface UpdatePlaceReviewDto {
  rating?: number
  comment?: string
  imageUrls?: string[]
}

export interface PartnerPlaceItem {
  id: string
  name: string
  description?: string | null
  address: string
  lat: number
  lng: number
  category?: string | null
  tags: string[]
  ownerId?: string
  status: 'pending' | 'published' | 'rejected'
  thumbnailUrl?: string | null
  imageUrl?: string | null
  deletedAt?: string | null
  deletedReason?: string | null
}

export interface CreatePlaceRequestDto {
  name: string
  description?: string
  address: string
  lat: number
  lng: number
  /** Place category UUID (form field may still be named `category`). */
  category: string
  destinationId?: string
  thumbnailUrl?: string
  imageUrl?: string
}
