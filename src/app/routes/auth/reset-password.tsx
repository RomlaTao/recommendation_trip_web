import { AuthLayout } from '@/components/layouts/AuthLayout'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export default function ResetPasswordRoute() {
  return (
    <AuthLayout
      heroTitle="Almost there."
      heroSubtitle="Set your new password and resume exploring the world."
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
