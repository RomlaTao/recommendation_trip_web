export interface AdminPlace {
  id: string
  name: string
  description?: string | null
  status: string
  address?: string
  lat?: number
  lng?: number
  city?: string
  country?: string
  category?: string
  categoryName?: string
  tags?: string[]
  thumbnailUrl?: string | null
  imageUrl?: string | null
  deletedAt?: string | null
  deletedReason?: string | null
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface AdminReview {
  id: string
  placeId: string
  placeName: string
  userId: string
  authorName: string
  rating: number
  comment: string | null
  status: 'active' | 'deleted'
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface AdminReviewsResponse {
  items: AdminReview[]
  total: number
  page: number
  limit: number
}
