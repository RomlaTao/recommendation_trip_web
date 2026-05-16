import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormValues = z.infer<typeof schema>

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message ?? 'An unexpected error occurred'
  }
  return 'An unexpected error occurred'
}

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit((values) => forgotPassword.mutate(values))

  useEffect(() => {
    document.title = 'Reset Password — BuildTrip'
  }, [])

  return (
    <>
      <div className="space-y-unit">
        <h1 className="font-headline-lg text-headline-lg text-primary">Secure your voyage</h1>
        <p className="font-body-md text-secondary">
          Enter your email and we&apos;ll send reset instructions if the account exists.
        </p>
      </div>

      {forgotPassword.isError && (
        <Alert variant="error" message={getApiErrorMessage(forgotPassword.error)} />
      )}

      {forgotPassword.isSuccess ? (
        <Alert
          variant="success"
          message="If this email is registered, password reset instructions have been sent. Check your inbox."
        />
      ) : (
        <form onSubmit={onSubmit} className="space-y-stack-sm" noValidate>
          <Input
            label="EMAIL ADDRESS"
            type="email"
            placeholder="traveller@buildtrip.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="pt-stack-sm">
            <Button type="submit" fullWidth isLoading={forgotPassword.isPending}>
              SEND RESET LINK
            </Button>
          </div>
        </form>
      )}

      <div className="text-center pt-stack-sm">
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
