import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'
import { passwordSchema } from '@/features/auth/utils/password.schema'

const schema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message ?? 'An unexpected error occurred'
  }
  return 'An unexpected error occurred'
}

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPassword = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit((values) =>
    resetPassword.mutate({ token, newPassword: values.newPassword }),
  )

  useEffect(() => {
    document.title = 'Set New Password — BuildTrip'
  }, [])

  if (!token) {
    return (
      <>
        <div className="space-y-unit">
          <h1 className="font-headline-lg text-headline-lg text-primary">Invalid link</h1>
        </div>
        <Alert variant="error" message="This reset link is invalid or has expired." />
        <div className="text-center pt-stack-sm">
          <Link
            to="/forgot-password"
            className="font-label-caps text-[11px] tracking-wider text-secondary hover:text-primary transition-colors duration-300"
          >
            REQUEST A NEW LINK
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-unit">
        <h1 className="font-headline-lg text-headline-lg text-primary">Almost there</h1>
        <p className="font-body-md text-secondary">Set your new password and resume exploring.</p>
      </div>

      {resetPassword.isError && (
        <Alert variant="error" message={getApiErrorMessage(resetPassword.error)} />
      )}

      <form onSubmit={onSubmit} className="space-y-stack-sm" noValidate>
        <Input
          label="NEW PASSWORD"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="CONFIRM PASSWORD"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="pt-stack-sm">
          <Button type="submit" fullWidth isLoading={resetPassword.isPending}>
            SET NEW PASSWORD
          </Button>
        </div>
      </form>
    </>
  )
}
