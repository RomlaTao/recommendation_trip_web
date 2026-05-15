import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { UserProfileOverview } from '@/features/users/components/UserProfileOverview'

export default function AccountProfileRoute() {
  return (
    <PublicSiteLayout showConcierge>
      <UserProfileOverview />
    </PublicSiteLayout>
  )
}
