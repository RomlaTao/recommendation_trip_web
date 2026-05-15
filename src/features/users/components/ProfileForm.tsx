import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useMyProfile } from '@/features/users/hooks/useMyProfile'
import { useUpdateProfile } from '@/features/users/hooks/useUpdateProfile'

const schema = z.object({
  phone: z.string().max(20).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

function getApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { message?: string } } }
    return e.response?.data?.message ?? 'Failed to update profile'
  }
  return 'Failed to update profile'
}

export function ProfileForm() {
  const { data: profile, isLoading } = useMyProfile()
  const update = useUpdateProfile()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
        bio: profile.bio ?? '',
        avatarUrl: profile.avatarUrl ?? '',
      })
    }
  }, [profile, reset])

  const onSubmit = handleSubmit((values) => {
    const clean = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
    ) as FormValues
    update.mutate(clean)
  })

  if (isLoading) {
    return <div className="font-body-md text-on-surface-variant py-8 text-center">Loading profile...</div>
  }

  return (
    <div className="space-y-stack-md">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar src={profile?.avatarUrl} name={profile?.username} size="lg" />
        <div>
          <p className="font-headline-md text-headline-md text-primary">{profile?.username}</p>
          <p className="font-body-md text-secondary text-sm">{profile?.email}</p>
          <span className="inline-block mt-1 font-label-caps text-[10px] tracking-wider bg-surface-container text-on-surface-variant px-2 py-0.5 uppercase">
            {profile?.role}
          </span>
        </div>
      </div>

      {update.isError && <Alert variant="error" message={getApiError(update.error)} />}
      {update.isSuccess && <Alert variant="success" message="Profile updated successfully." />}

      <form onSubmit={onSubmit} className="space-y-stack-sm" noValidate>
        <Input
          label="AVATAR URL"
          type="url"
          placeholder="https://example.com/photo.jpg"
          error={errors.avatarUrl?.message}
          {...register('avatarUrl')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-sm">
          <Input label="CITY" type="text" placeholder="Ho Chi Minh City" error={errors.city?.message} {...register('city')} />
          <Input label="COUNTRY" type="text" placeholder="Vietnam" error={errors.country?.message} {...register('country')} />
        </div>
        <Input label="PHONE" type="tel" placeholder="+84 900 000 000" error={errors.phone?.message} {...register('phone')} />
        <div className="space-y-unit">
          <label className="font-label-caps text-label-caps text-on-surface-variant block">BIO</label>
          <textarea
            rows={4}
            placeholder="Tell travellers about yourself..."
            className="w-full px-4 py-3 bg-white border border-outline-variant rounded-none focus:outline-none focus:border-primary transition-colors duration-300 font-body-md resize-none"
            {...register('bio')}
          />
        </div>

        <div className="pt-stack-sm">
          <Button type="submit" fullWidth isLoading={update.isPending} disabled={!isDirty}>
            SAVE PROFILE
          </Button>
        </div>
      </form>
    </div>
  )
}
