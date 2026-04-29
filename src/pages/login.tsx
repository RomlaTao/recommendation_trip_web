import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import type { ApiError } from '@/core/api/axios'
import { useLoginMutation } from '@/features/auth/hooks'

const loginSchema = z.object({
  email: z.email('Email is invalid'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  return 'statusCode' in error && 'message' in error
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = (location.state as { from?: string } | null)?.from ?? '/trips'
  const loginMutation = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values)
    navigate(fromPath, { replace: true })
  })

  const errorMessage = isApiError(loginMutation.error)
    ? loginMutation.error.message
    : 'Sign in with your account to continue.'

  return (
    <section className="panel">
      <h2>Login</h2>
      <p>{errorMessage}</p>
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input type="email" autoComplete="email" {...register('email')} />
          {errors.email ? <small>{errors.email.message}</small> : null}
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" {...register('password')} />
          {errors.password ? <small>{errors.password.message}</small> : null}
        </label>

        <button className="button" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}
