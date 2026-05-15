import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/admin.api'

export function useAdminPlaces(status?: string) {
  return useQuery({
    queryKey: ['admin', 'places', status ?? 'all'],
    queryFn: () => adminApi.listPlaces(status),
  })
}

export function useAdminPendingPlaces() {
  return useQuery({
    queryKey: ['admin', 'places', 'pending'],
    queryFn: adminApi.listPendingPlaces,
  })
}

export function useApprovePlace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.approvePlace(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'places'] }),
  })
}

export function useRejectPlace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectPlace(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'places'] }),
  })
}

export function useUpdatePlaceByAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: {
        name?: string
        description?: string
        address?: string
        category?: string
        thumbnailUrl?: string
        imageUrl?: string
      }
    }) => adminApi.updatePlace(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'places'] }),
  })
}

export function useDeletePlaceByAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.deletePlace(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'places'] }),
  })
}

export function useRestorePlaceByAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.restorePlace(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'places'] }),
  })
}
