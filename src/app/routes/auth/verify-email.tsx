import { AuthLayout } from '@/components/layouts/AuthLayout'
import { VerifyEmailNotice } from '@/features/auth/components/VerifyEmailNotice'

export default function VerifyEmailRoute() {
  return (
    <AuthLayout
      heroTitle="One last step."
      heroSubtitle="Verify your email to unlock the full BuildTrip experience."
    >
      <VerifyEmailNotice />
    </AuthLayout>
  )
}
