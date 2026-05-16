import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLogin } from '@/features/auth/hooks/useLogin'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message ?? 'An unexpected error occurred'
  }
  return 'An unexpected error occurred'
}

export function LoginForm() {
  const [searchParams] = useSearchParams()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit((values) => login.mutate(values))

  const successMessage = searchParams.get('reset') === 'success'
    ? 'Password reset successfully. Please sign in.'
    : searchParams.get('verified') === 'true'
    ? 'Email verified. Welcome aboard!'
    : null

  useEffect(() => {
    document.title = 'Sign In — BuildTrip'
  }, [])

  return (
    <>
      <div className="space-y-unit">
        <h1 className="font-headline-lg text-headline-lg text-primary">Welcome back</h1>
        <p className="font-body-md text-secondary">Access your global itinerary and travel plans.</p>
      </div>

      {successMessage && <Alert variant="success" message={successMessage} />}
      {login.isError && <Alert variant="error" message={getApiErrorMessage(login.error)} />}

      <form onSubmit={onSubmit} className="space-y-stack-sm" noValidate>
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
          autoComplete="current-password"
          error={errors.password?.message}
          rightLabel={
            <Link
              to="/forgot-password"
              className="font-label-caps text-[10px] text-secondary hover:text-primary transition-colors duration-300"
            >
              FORGOT PASSWORD?
            </Link>
          }
          {...register('password')}
        />

        <div className="pt-stack-sm">
          <Button type="submit" fullWidth isLoading={login.isPending}>
            CONTINUE TO VOYAGE
          </Button>
        </div>
      </form>

      <div className="text-center pt-stack-sm">
        <p className="font-body-md text-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </>
  )
}
