import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useResendVerification } from '@/features/auth/hooks/useResendVerification'
import { useVerifyEmail } from '@/features/auth/hooks/useVerifyEmail'

export function VerifyEmailNotice() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const verifyEmail = useVerifyEmail()
  const resend = useResendVerification()

  // Auto-verify if token present in URL (link click from email)
  useEffect(() => {
    if (token) {
      verifyEmail.mutate({ token })
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = 'Verify Email — BuildTrip'
  }, [])

  if (token) {
    return (
      <>
        <div className="space-y-unit">
          <h1 className="font-headline-lg text-headline-lg text-primary">Verifying email</h1>
        </div>

        {verifyEmail.isPending && (
          <Alert variant="info" message="Verifying your email address..." />
        )}
        {verifyEmail.isError && (
          <Alert
            variant="error"
            message="This verification link is invalid or has expired. Please request a new one below."
          />
        )}
        {verifyEmail.isSuccess && (
          <Alert variant="success" message="Email verified! You can now sign in." />
        )}

        <div className="text-center pt-stack-sm">
          <Link
            to="/login"
            className="font-label-caps text-[11px] tracking-wider text-secondary hover:text-primary transition-colors duration-300"
          >
            GO TO SIGN IN →
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-unit">
        <h1 className="font-headline-lg text-headline-lg text-primary">One last step</h1>
        <p className="font-body-md text-secondary">
          Verify your email to unlock the full BuildTrip experience.
        </p>
      </div>

      <div className="bg-surface-container rounded px-6 py-5 space-y-unit">
        <p className="font-body-md text-on-surface">
          We sent a verification link to{' '}
          {email ? (
            <span className="font-bold text-primary">{email}</span>
          ) : (
            'your email address'
          )}
          . Click the link in the email to confirm your account.
        </p>
        <p className="font-body-md text-on-surface-variant text-sm">
          Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
      </div>

      {resend.isError && (
        <Alert variant="error" message="Failed to resend. Please try again." />
      )}
      {resend.isSuccess && (
        <Alert variant="success" message="Verification email resent. Check your inbox." />
      )}

      {!resend.isSuccess && (
        <div className="pt-stack-sm">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            isLoading={resend.isPending}
            onClick={() => email && resend.mutate({ email })}
            disabled={!email}
          >
            RESEND VERIFICATION EMAIL
          </Button>
        </div>
      )}

      <div className="text-center pt-unit">
        <Link
          to="/login"
          className="font-label-caps text-[11px] tracking-wider text-secondary hover:text-primary transition-colors duration-300"
        >
          ← BACK TO SIGN IN
        </Link>
      </div>
    </>
  )
}
