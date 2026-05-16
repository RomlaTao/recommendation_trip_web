import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { passwordSchema } from '@/features/auth/utils/password.schema'
import { useAdminForcePassword } from '@/features/users/hooks/admin/useAdminMutations'
import type { UserProfile } from '@/features/users/types/users.types'

interface Props {
  user: UserProfile
  onClose: () => void
}

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm the password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
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

export function ForcePasswordModal({ user, onClose }: Props) {
  const forcePassword = useAdminForcePassword()

  const { register, handleSubmit, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit((values) => {
    forcePassword.mutate(
      { id: user.id, dto: { password: values.password } },
      { onSuccess: onClose },
    )
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/40 px-4">
      <div className="bg-surface-container-lowest w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-primary">
            Force password — {user.username}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-label-caps text-[11px] tracking-wider text-on-surface-variant hover:text-primary"
          >
            CLOSE ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-stack-md space-y-stack-sm" noValidate>
          {forcePassword.isError && <Alert variant="error" message={getApiError(forcePassword.error)} />}

          <Input
            label="NEW PASSWORD"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="CONFIRM PASSWORD"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="pt-stack-sm flex gap-3">
            <Button type="submit" fullWidth isLoading={forcePassword.isPending}>
              SET PASSWORD
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
