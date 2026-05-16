import { Avatar } from '@/components/ui/Avatar'
import type { PublicUserCard as PublicUserCardType } from '@/features/users/types/users.types'

interface Props {
  user: PublicUserCardType
}

export function PublicUserCard({ user }: Props) {
  const location = [user.city, user.country].filter(Boolean).join(', ')

  return (
    <div className="flex flex-col items-center text-center space-y-stack-sm py-stack-lg">
      <Avatar src={user.avatarUrl} name={user.username} size="lg" />

      <div className="space-y-unit">
        <h1 className="font-headline-lg text-headline-lg text-primary">{user.username}</h1>
        {location && (
          <p className="font-label-caps text-[11px] tracking-wider text-on-surface-variant uppercase">
            {location}
          </p>
        )}
      </div>

      {user.bio && (
        <p className="font-body-md text-secondary max-w-md">{user.bio}</p>
      )}
    </div>
  )
}
