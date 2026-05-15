import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/admin.api'

export function useAdminReviews(params: {
  page: number
  limit: number
  q?: string
  rating?: number
  status?: 'all' | 'active' | 'deleted'
}) {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: () => adminApi.listReviews(params),
    placeholderData: (prev) => prev,
  })
}

export function useSoftDeleteReviewByAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: string) => adminApi.softDeleteReview(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}

export function useRestoreReviewByAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: string) => adminApi.restoreReview(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}
