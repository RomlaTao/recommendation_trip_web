import type { PlaceDetail, PlaceListItem } from '@/features/places/types/places.types'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { placesApi } from '@/features/places/api/places.api'
import { useAuthStore } from '@/features/auth/store'
import { Avatar } from '@/components/ui/Avatar'
import { AddPlaceToTripPopover } from '@/features/trips/components/AddPlaceToTripPopover'

interface Props {
  place: PlaceDetail
  similarPlaces?: PlaceListItem[]
}

export function PlaceDetailContent({ place, similarPlaces = [] }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  const [draftRating, setDraftRating] = useState(0)
  const [draftComment, setDraftComment] = useState('')
  const [openMenuReviewId, setOpenMenuReviewId] = useState<string | null>(null)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')

  const reviewsQuery = useQuery({
    queryKey: ['places', 'reviews', place.id],
    queryFn: () => placesApi.listReviews(place.id, 1, 100),
  })

  const myReview = useMemo(
    () =>
      reviewsQuery.data?.items.find((item) => item.userId === currentUser?.id) ?? null,
    [reviewsQuery.data?.items, currentUser?.id],
  )

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!draftRating || draftRating < 1 || draftRating > 5) {
        throw new Error('Please choose a rating from 1 to 5 stars.')
      }
      return placesApi.createOrUpdateMyReview(place.id, {
        rating: draftRating,
        comment: draftComment.trim() || undefined,
      })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['places', 'reviews', place.id] }),
        queryClient.invalidateQueries({ queryKey: ['places', 'detail', place.id] }),
        queryClient.invalidateQueries({ queryKey: ['places', 'search'] }),
      ])
      setDraftRating(0)
      setDraftComment('')
    },
  })

  const handleSubmitReview = () => {
    if (!isAuthenticated) return
    if (myReview) {
      setEditingReviewId(myReview.id)
      setEditRating(myReview.rating)
      setEditComment(myReview.comment ?? '')
      return
    }
    submitReviewMutation.mutate()
  }

  const updateInlineReviewMutation = useMutation({
    mutationFn: async () => {
      if (!editingReviewId) {
        throw new Error('No review is selected for editing.')
      }
      if (!editRating || editRating < 1 || editRating > 5) {
        throw new Error('Please choose a rating from 1 to 5 stars.')
      }
      return placesApi.updateMyReviewById(editingReviewId, {
        rating: editRating,
        comment: editComment.trim() || undefined,
      })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['places', 'reviews', place.id] }),
        queryClient.invalidateQueries({ queryKey: ['places', 'detail', place.id] }),
        queryClient.invalidateQueries({ queryKey: ['places', 'search'] }),
      ])
      setEditingReviewId(null)
      setEditRating(0)
      setEditComment('')
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => placesApi.deleteMyReviewById(reviewId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['places', 'reviews', place.id] }),
        queryClient.invalidateQueries({ queryKey: ['places', 'detail', place.id] }),
        queryClient.invalidateQueries({ queryKey: ['places', 'search'] }),
      ])
      setEditingReviewId(null)
    },
  })
  const gallery = place.imageUrls?.slice(0, 4) ?? []
  const calculatedFromReviews =
    reviewsQuery.data && reviewsQuery.data.items.length > 0
      ? {
          average:
            reviewsQuery.data.items.reduce((acc, item) => acc + item.rating, 0) /
            reviewsQuery.data.items.length,
          count: reviewsQuery.data.total,
        }
      : null

  const effectiveAverage = calculatedFromReviews
    ? calculatedFromReviews.average
    : place.communityRating.averageRating ?? place.seedRating.averageRating

  const effectiveReviewCount = calculatedFromReviews
    ? calculatedFromReviews.count
    : place.communityRating.reviewCount > 0
      ? place.communityRating.reviewCount
      : place.seedRating.reviewCount

  return (
    <div className="pt-20">
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-primary">
          <img
            alt={place.name}
            className="w-full h-full object-cover"
            src={place.thumbnailUrl || place.imageUrls?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-scrim/80 via-scrim/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 w-full px-margin-edge pb-stack-lg max-w-container-max mx-auto right-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-on-media/20 backdrop-blur-sm text-on-media px-3 py-1 rounded-full text-label-caps flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {effectiveAverage?.toFixed(1) ?? 'N/A'}
              </span>
              <span className="bg-on-media/20 backdrop-blur-sm text-on-media px-3 py-1 rounded-full text-label-caps">
                {place.categoryName ?? 'PLACE'}
              </span>
            </div>
            <h1 className="text-on-media font-display-xl tracking-tighter">{place.name}</h1>
            <div className="flex items-center gap-1 text-on-media/90">
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span className="font-body-lg">{place.address}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-edge py-stack-lg grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-stack-lg">
          <div className="flex flex-wrap items-center gap-4 pb-stack-sm border-b border-outline-variant">
            <AddPlaceToTripPopover
              placeId={place.id}
              triggerLabel="ADD TO TRIP"
              className="bg-primary text-on-primary px-8 py-4 rounded-lg font-label-caps"
            />
            <button className="border border-primary text-primary px-6 py-4 rounded-lg font-label-caps flex items-center gap-2">
              <span className="material-symbols-outlined">favorite</span>FAVORITE
            </button>
            <button className="border border-primary text-primary px-6 py-4 rounded-lg font-label-caps flex items-center gap-2">
              <span className="material-symbols-outlined">share</span>SHARE
            </button>
          </div>

          <div className="flex flex-col gap-stack-sm">
            <h2 className="font-headline-lg text-primary">An Urban Sanctuary</h2>
            <p className="text-on-surface-variant font-body-lg leading-relaxed max-w-3xl">
              {place.description || 'A curated luxury destination blending local identity with refined hospitality and architectural clarity.'}
            </p>
          </div>

          <div className="flex flex-col gap-stack-sm mb-stack-lg">
            <h3 className="font-label-caps text-on-surface-variant uppercase">Review Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(gallery.length ? gallery : new Array(4).fill(place.thumbnailUrl || '')).map((url, idx) => (
                <img
                  key={`${url}-${idx}`}
                  alt={`Guest photo ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-300"
                  src={url || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&q=80'}
                />
              ))}
            </div>
          </div>

          <div className="bg-accent-highlight/30 p-8 rounded-3xl flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2 text-primary-container font-medium">
                <span className="material-symbols-outlined">chat_bubble</span>
                <span>Share your experience at {place.name}</span>
              </div>
              <p className="text-sm text-secondary">
                {isAuthenticated
                  ? myReview
                    ? 'You already reviewed this place. Use Edit in your review card to update.'
                    : 'How was your stay? Let others know what you thought.'
                  : 'Please sign in to submit your review.'}
              </p>
            </div>
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => isAuthenticated && setDraftRating(i + 1)}
                  disabled={!isAuthenticated}
                  className={`material-symbols-outlined text-[30px] transition-transform disabled:opacity-40 disabled:hover:scale-100 ${
                    i < draftRating ? 'text-rating-star' : 'text-secondary'
                  }`}
                  style={{ fontVariationSettings: i < draftRating ? "'FILL' 1" : "'FILL' 0, 'wght' 300" }}
                >
                  star
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold tracking-wide text-on-surface-variant">
              {draftRating > 0 ? `${draftRating} / 5 stars` : 'Select your rating'}
            </p>
            <div className="relative w-full max-w-2xl group">
              <input
                className="w-full bg-surface-container-lowest border-2 border-primary rounded-full py-4 px-6 pr-28 text-primary focus:ring-0 focus:border-primary transition-all placeholder:text-secondary"
                placeholder="What did you think of this place?"
                type="text"
                value={draftComment}
                onChange={(e) => setDraftComment(e.target.value)}
                disabled={!isAuthenticated}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button type="button" className="p-2 text-secondary hover:text-primary" title="Add Photo">
                  <span className="material-symbols-outlined">photo_camera</span>
                </button>
                <button type="button" className="p-2 text-secondary hover:text-primary">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={
                    !isAuthenticated ||
                    submitReviewMutation.isPending ||
                    (!myReview && !draftRating)
                  }
                  className="bg-primary text-on-primary p-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  title={myReview ? 'Switch to edit this review' : 'Submit review'}
                >
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
              </div>
            </div>
            {submitReviewMutation.isError && (
              <p className="text-sm text-error">
                {(submitReviewMutation.error as Error)?.message ?? 'Failed to submit review.'}
              </p>
            )}
            {submitReviewMutation.isSuccess && (
              <p className="text-sm text-on-surface-variant">
                Your review was submitted.
              </p>
            )}
          </div>

          <div className="p-gutter border border-outline-variant rounded-xl bg-surface-container-lowest">
            <h3 className="font-headline-md text-primary mb-2">Guest Reviews ({effectiveReviewCount})</h3>
            {reviewsQuery.data && reviewsQuery.data.items.length > 0 ? (
              <div className="space-y-4">
                {reviewsQuery.data.items.slice(0, 3).map((review) => (
                  <article key={review.id} className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          name={
                            review.userId === currentUser?.id
                              ? (currentUser?.username ?? 'You')
                              : `User ${review.userId.slice(0, 8)}`
                          }
                          src={null}
                        />
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {review.userId === currentUser?.id
                              ? (currentUser?.username ?? 'You')
                              : `User ${review.userId.slice(0, 8)}`}
                          </p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`material-symbols-outlined text-base ${
                                  i < review.rating ? 'text-rating-star' : 'text-outline'
                                }`}
                                style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </span>
                            ))}
                            <span className="ml-1 text-xs font-semibold text-on-surface-variant">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.userId === currentUser?.id && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuReviewId((prev) => (prev === review.id ? null : review.id))
                            }
                            className="h-8 w-8 rounded-full hover:bg-surface-container flex items-center justify-center"
                            aria-label="Review options"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>
                          </button>
                          {openMenuReviewId === review.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden z-20">
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container-low"
                                onClick={() => {
                                  setEditingReviewId(review.id)
                                  setEditRating(review.rating)
                                  setEditComment(review.comment ?? '')
                                  setOpenMenuReviewId(null)
                                }}
                              >
                                Sửa review
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error-container"
                                onClick={() => {
                                  setOpenMenuReviewId(null)
                                  deleteReviewMutation.mutate(review.id)
                                }}
                              >
                                Xoá review
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {editingReviewId === review.id ? (
                      <div className="mt-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setEditRating(i + 1)}
                              className={`material-symbols-outlined text-[24px] transition-transform ${
                                i < editRating ? 'text-rating-star' : 'text-secondary'
                              }`}
                              style={{ fontVariationSettings: i < editRating ? "'FILL' 1" : "'FILL' 0, 'wght' 300" }}
                            >
                              star
                            </button>
                          ))}
                          <span className="ml-2 text-xs font-semibold text-on-surface-variant">
                            {editRating > 0 ? `${editRating}/5` : 'Select rating'}
                          </span>
                        </div>
                        <input
                          className="w-full rounded-lg border border-outline px-3 py-2 text-sm focus:border-primary focus:outline-none"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Update your review..."
                          type="text"
                        />
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateInlineReviewMutation.mutate()}
                            disabled={updateInlineReviewMutation.isPending || !editRating}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary disabled:opacity-50"
                          >
                            {updateInlineReviewMutation.isPending ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReviewId(null)
                              setEditRating(0)
                              setEditComment('')
                            }}
                            className="rounded-lg border border-outline px-3 py-1.5 text-xs font-semibold text-on-surface-variant"
                          >
                            Cancel
                          </button>
                        </div>
                        {updateInlineReviewMutation.isError && (
                          <p className="mt-2 text-xs text-error">
                            {(updateInlineReviewMutation.error as Error)?.message ??
                              'Failed to update review.'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant italic">
                        {review.comment || 'No written comment.'}
                      </p>
                    )}
                  </article>
                ))}
                {deleteReviewMutation.isError && (
                  <p className="text-sm text-error">Failed to delete review.</p>
                )}
                {deleteReviewMutation.isPending && (
                  <p className="text-sm text-secondary">Deleting review...</p>
                )}
              </div>
            ) : (
              <p className="text-on-surface-variant italic">
                No guest reviews yet. Be the first to share your experience.
              </p>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-[100px] flex flex-col gap-gutter">
            <div className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant shadow-sm">
              <div className="h-64 bg-surface-container relative">
                <img
                  alt="Map"
                  className="w-full h-full object-cover grayscale opacity-50"
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&q=80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_pin</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col gap-4">
              <h4 className="font-label-caps text-primary">TRIP PLANNER TIPS</h4>
              <p className="text-body-md text-on-surface-variant">Best time to visit is early morning or sunset for ideal photography and lighter traffic.</p>
              <p className="text-body-md text-on-surface-variant">Booking 2-3 weeks in advance is recommended for peak season.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-surface-container-low py-stack-lg border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-edge">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-extrabold uppercase tracking-tight text-primary mb-2">Similar Destinations</h2>
              <p className="text-on-surface-variant">Hand-picked luxury sanctuaries for your next journey.</p>
            </div>
            <Link to="/places" className="bg-surface-container-lowest border border-primary text-primary px-6 py-2 rounded-full font-label-caps hover:bg-primary hover:text-on-primary transition-all">
              EXPLORE ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(similarPlaces.length > 0 ? similarPlaces.slice(0, 4) : []).map((item) => {
              const avg = item.communityRating.averageRating ?? item.seedRating.averageRating
              const cnt = item.communityRating.reviewCount > 0 ? item.communityRating.reviewCount : item.seedRating.reviewCount
              return (
                <div
                  key={item.id}
                  className="group cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden hover:border-primary transition-colors"
                  onClick={() => navigate(`/places/${item.id}`)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden mb-4">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'}
                      alt={item.name}
                    />
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 right-4 bg-on-media/90 backdrop-blur p-2 rounded-full"
                    >
                      <span className="material-symbols-outlined text-primary">favorite</span>
                    </button>
                  </div>
                  <div className="px-4 pb-4">
                    <h3 className="font-headline-md text-lg mb-1 line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-secondary mb-3">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span className="line-clamp-1">{item.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-on-surface-variant mb-3">
                      <span className="material-symbols-outlined text-[16px] text-rating-star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{avg?.toFixed(1) ?? 'N/A'}</span>
                      <span className="text-xs">({cnt} Reviews)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/places/${item.id}`)
                        }}
                        className="py-2 border border-outline-variant hover:border-primary text-primary font-label-caps text-[10px] tracking-widest uppercase transition-colors rounded-xl"
                      >
                        Details
                      </button>
                      <AddPlaceToTripPopover
                        placeId={item.id}
                        className="w-full py-2 bg-primary text-on-primary font-label-caps text-[10px] tracking-widest uppercase hover:bg-primary-strong transition-colors rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
