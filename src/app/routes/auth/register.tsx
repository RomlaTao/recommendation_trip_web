import { AuthLayout } from '@/components/layouts/AuthLayout'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterRoute() {
  return (
    <AuthLayout
      heroTitle="Begin your journey."
      heroSubtitle="Join thousands of travellers curating their perfect experience across the globe."
    >
      <RegisterForm />
    </AuthLayout>
  )
}
