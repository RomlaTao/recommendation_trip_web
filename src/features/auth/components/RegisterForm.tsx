import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRegister } from '@/features/auth/hooks/useRegister'
import { passwordSchema } from '@/features/auth/utils/password.schema'

const schema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username too long')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
})

type FormValues = z.infer<typeof schema>

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message ?? 'An unexpected error occurred'
  }
  return 'An unexpected error occurred'
}

export function RegisterForm() {
  const register_ = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit((values) => register_.mutate(values))

  useEffect(() => {
    document.title = 'Create Account — BuildTrip'
  }, [])

  return (
    <>
      <div className="space-y-unit">
        <h1 className="font-headline-lg text-headline-lg text-primary">Begin your journey</h1>
        <p className="font-body-md text-secondary">Join thousands of travellers curating their perfect experience.</p>
      </div>

      {register_.isError && (
        <Alert variant="error" message={getApiErrorMessage(register_.error)} />
      )}

      <form onSubmit={onSubmit} className="space-y-stack-sm" noValidate>
        <Input
          label="USERNAME"
          type="text"
          placeholder="your_username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="EMAIL ADDRESS"
          type="email"
          placeholder="traveller@buildtrip.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="PASSWORD"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="pt-stack-sm">
          <Button type="submit" fullWidth isLoading={register_.isPending}>
            CREATE ACCOUNT
          </Button>
        </div>
      </form>

      <div className="text-center pt-stack-sm">
        <p className="font-body-md text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}
