import { AuthLayout } from '@/components/layouts/AuthLayout'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordRoute() {
  return (
    <AuthLayout
      heroTitle="Secure your voyage."
      heroSubtitle="Reset your credentials to continue your journey without interruption."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
