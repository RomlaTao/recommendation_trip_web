import { useLogoutMutation } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'

export function SessionActions() {
  const profile = useAuthStore((state) => state.profile)
  const status = useAuthStore((state) => state.status)
  const logoutMutation = useLogoutMutation()

  if (status !== 'authenticated') {
    return null
  }

  return (
    <section className="panel auth-session">
      <p>Signed in as {profile?.username ?? profile?.email ?? 'user'}</p>
      <button className="button" type="button" onClick={() => logoutMutation.mutate()}>
        Sign out
      </button>
    </section>
  )
}
