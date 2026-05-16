import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { passwordSchema } from '@/features/auth/utils/password.schema'
import { useUpdatePassword } from '@/features/users/hooks/useUpdatePassword'

const schema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

function getApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { message?: string } } }
    return e.response?.data?.message ?? 'Failed to update password'
  }
  return 'Failed to update password'
}

export function ChangePasswordForm() {
  const update = useUpdatePassword()
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit((values) => {
    update.mutate(
      { oldPassword: values.oldPassword, newPassword: values.newPassword },
      { onSuccess: () => reset() },
    )
  })

  return (
    <div className="space-y-stack-md">
      <div className="space-y-unit">
        <h2 className="font-headline-md text-headline-md text-primary">Change password</h2>
        <p className="font-body-md text-secondary">
          Use a strong password with at least 8 characters, including a letter and a number.
        </p>
      </div>

      {update.isError && <Alert variant="error" message={getApiError(update.error)} />}
      {update.isSuccess && <Alert variant="success" message="Password changed successfully." />}

      <form onSubmit={onSubmit} className="space-y-stack-sm" noValidate>
        <Input
          label="CURRENT PASSWORD"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.oldPassword?.message}
          {...register('oldPassword')}
        />
        <Input
          label="NEW PASSWORD"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="CONFIRM NEW PASSWORD"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <div className="pt-stack-sm">
          <Button type="submit" fullWidth isLoading={update.isPending}>
            UPDATE PASSWORD
          </Button>
        </div>
      </form>
    </div>
  )
}
