import { useParams } from 'react-router-dom'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { Alert } from '@/components/ui/Alert'
import { PublicUserCard } from '@/features/users/components/PublicUserCard'
import { usePublicUserByUsername } from '@/features/users/hooks/usePublicUser'

export default function PublicProfileRoute() {
  const { username = '' } = useParams<{ username: string }>()
  const { data, isLoading, isError } = usePublicUserByUsername(username)

  return (
    <PublicSiteLayout>
      <div className="max-w-screen-sm mx-auto px-gutter py-stack-lg pt-32 min-h-screen">
        {isLoading && (
          <p className="font-body-md text-on-surface-variant text-center py-8">Loading profile...</p>
        )}
        {isError && <Alert variant="error" message="User not found." />}
        {data && <PublicUserCard user={data} />}
      </div>
    </PublicSiteLayout>
  )
}
