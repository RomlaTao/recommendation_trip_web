import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import {
  DynamicFormFields,
  type DynamicFormFieldConfig,
} from '@/components/forms/DynamicFormFields'
import { passwordSchema } from '@/features/auth/utils/password.schema'
import {
  useAdminCreateUser,
  useAdminUpdateUser,
} from '@/features/users/hooks/admin/useAdminMutations'
import type { UserProfile } from '@/features/users/types/users.types'

interface Props {
  user?: UserProfile | null
  onClose: () => void
}

const createSchema = z.object({
  username: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
  email: z.string().email('Invalid email'),
  password: passwordSchema,
  role: z.enum(['user', 'admin', 'partner']),
})

const editSchema = z.object({
  username: z.string().min(2).max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  role: z.enum(['user', 'admin', 'partner']),
  phone: z.string().max(20).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  isActive: z.boolean(),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>
type FormValues = CreateValues & Partial<Omit<EditValues, keyof CreateValues>>

function getApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { message?: string } } }
    return e.response?.data?.message ?? 'Operation failed'
  }
  return 'Operation failed'
}

export function UserFormModal({ user, onClose }: Props) {
  const isEdit = !!user
  const createUser = useAdminCreateUser()
  const updateUser = useAdminUpdateUser()

  const mutation = isEdit ? updateUser : createUser
  const schema = isEdit ? editSchema : createSchema

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: isEdit
      ? {
          username: user?.username ?? '',
          email: user?.email ?? '',
          role: (user?.role ?? 'user') as 'user' | 'admin' | 'partner',
          phone: user?.phone ?? '',
          city: user?.city ?? '',
          country: user?.country ?? '',
          isActive: user?.isActive ?? true,
        }
      : {
          username: '',
          email: '',
          password: '',
          role: 'user',
          phone: '',
          city: '',
          country: '',
          isActive: true,
        },
  })

  useEffect(() => {
    if (!isEdit) {
      reset({
        username: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        city: '',
        country: '',
        isActive: true,
      })
    }
  }, [user, isEdit, reset])

  const onSubmit = handleSubmit((values) => {
    if (isEdit && user) {
      const dto = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
      )
      updateUser.mutate(
        { id: user.id, dto },
        { onSuccess: onClose },
      )
    } else {
      const { username, email, password, role } = values
      createUser.mutate({ username, email, password: password ?? '', role }, { onSuccess: onClose })
    }
  })

  const baseFields: DynamicFormFieldConfig[] = [
    {
      name: 'username',
      label: 'USERNAME',
      type: 'text',
      placeholder: 'username',
      wrapperClassName: 'col-span-1',
    },
    {
      name: 'email',
      label: 'EMAIL',
      type: 'email',
      placeholder: 'user@example.com',
      wrapperClassName: 'col-span-1',
    },
  ]

  const createOnlyFields: DynamicFormFieldConfig[] = [
    {
      name: 'password',
      label: 'PASSWORD',
      type: 'password',
      placeholder: '••••••••',
    },
  ]

  const roleField: DynamicFormFieldConfig[] = [
    {
      name: 'role',
      label: 'ROLE',
      type: 'select',
      options: [
        { value: 'user', label: 'User' },
        { value: 'partner', label: 'Partner' },
        { value: 'admin', label: 'Admin' },
      ],
    },
  ]

  const editOnlyFields: DynamicFormFieldConfig[] = [
    {
      name: 'city',
      label: 'CITY',
      type: 'text',
      placeholder: 'City',
      wrapperClassName: 'col-span-1',
    },
    {
      name: 'country',
      label: 'COUNTRY',
      type: 'text',
      placeholder: 'Country',
      wrapperClassName: 'col-span-1',
    },
    {
      name: 'phone',
      label: 'PHONE',
      type: 'tel',
      placeholder: '+84...',
    },
    {
      name: 'isActive',
      label: 'ACTIVE',
      type: 'checkbox',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/40 px-4">
      <div className="bg-surface-container-lowest w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-primary">
            {isEdit ? `Edit — ${user?.username}` : 'Create User'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-label-caps text-[11px] tracking-wider text-on-surface-variant hover:text-primary"
          >
            CLOSE ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="px-6 py-stack-md space-y-stack-sm" noValidate>
          {mutation.isError && <Alert variant="error" message={getApiError(mutation.error)} />}

          <div className="grid grid-cols-2 gap-stack-sm">
            <DynamicFormFields
              fields={baseFields}
              register={register}
              errors={errors}
            />
          </div>

          {!isEdit && (
            <DynamicFormFields
              fields={createOnlyFields}
              register={register}
              errors={errors}
            />
          )}

          <DynamicFormFields
            fields={roleField}
            register={register}
            errors={errors}
          />

          {isEdit && (
            <>
              <div className="grid grid-cols-2 gap-stack-sm">
                <DynamicFormFields
                  fields={editOnlyFields.slice(0, 2)}
                  register={register}
                  errors={errors}
                />
              </div>
              <DynamicFormFields
                fields={editOnlyFields.slice(2)}
                register={register}
                errors={errors}
              />
            </>
          )}

          <div className="pt-stack-sm flex gap-3">
            <Button type="submit" fullWidth isLoading={mutation.isPending}>
              {isEdit ? 'SAVE CHANGES' : 'CREATE USER'}
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
