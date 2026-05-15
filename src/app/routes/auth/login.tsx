import { AuthLayout } from '@/components/layouts/AuthLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginRoute() {
  return (
    <AuthLayout
      heroTitle="The horizon is yours."
      heroSubtitle="Redefining the essence of travel through architectural silence and curated experiences."
    >
      <LoginForm />
    </AuthLayout>
  )
}
