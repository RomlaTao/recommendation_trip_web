import { useParams } from 'react-router-dom'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { Alert } from '@/components/ui/Alert'
import { PlaceDetailContent } from '@/features/places/components/PlaceDetailContent'
import { usePlaceDetail } from '@/features/places/hooks/usePlaceDetail'
import { useQuery } from '@tanstack/react-query'
import { placesApi } from '@/features/places/api/places.api'

export default function PlaceDetailRoute() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = usePlaceDetail(id)
  const similarQuery = useQuery({
    queryKey: ['places', 'similar', data?.categoryId, id],
    enabled: !!data,
    queryFn: async () => {
      const res = await placesApi.search({
        categoryId: data?.categoryId ?? undefined,
        sort: 'rating_desc',
        page: 1,
        limit: 8,
      })
      return res.items.filter((item) => item.id !== id).slice(0, 4)
    },
  })

  return (
    <PublicSiteLayout showConcierge>
      {isLoading && <div className="py-40 text-center text-on-surface-variant">Loading place details...</div>}
      {isError && <div className="max-w-screen-xl mx-auto px-gutter py-32"><Alert variant="error" message="Failed to load place details." /></div>}
      {data && <PlaceDetailContent place={data} similarPlaces={similarQuery.data ?? []} />}
    </PublicSiteLayout>
  )
}
