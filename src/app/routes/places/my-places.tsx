import { useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DynamicFormFields } from '@/components/forms/DynamicFormFields'
import { placesApi } from '@/features/places/api/places.api'
import { useCreatePlaceRequest, useMyPlaceRequests } from '@/features/places/hooks/usePartnerPlaces'

const createPlaceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  address: z.string().min(3, 'Address is required'),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  category: z.string().min(1, 'Category is required'),
  thumbnailUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type CreatePlaceFormValues = z.infer<typeof createPlaceSchema>

const tabs = [
  { key: 'published', label: 'My Places (Approved)' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
] as const

function getApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { message?: string | string[] } } }
    const message = e.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (message) return message
  }
  return 'Operation failed'
}

export default function MyPlacesRoute() {
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('published')
  const [keyword, setKeyword] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const placesQuery = useMyPlaceRequests()
  const createPlace = useCreatePlaceRequest()
  const categoriesQuery = useQuery({
    queryKey: ['places', 'categories'],
    queryFn: placesApi.categories,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePlaceFormValues>({
    resolver: zodResolver(createPlaceSchema) as Resolver<CreatePlaceFormValues>,
    defaultValues: {
      name: '',
      description: '',
      address: '',
      lat: 0,
      lng: 0,
      category: '',
      thumbnailUrl: '',
      imageUrl: '',
    },
  })

  const rows = useMemo(() => {
    const list = placesQuery.data ?? []
    return list
      .filter((item) => item.status === tab)
      .filter((item) => {
        const q = keyword.trim().toLowerCase()
        if (!q) return true
        return [item.name, item.address]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      })
  }, [placesQuery.data, keyword, tab])

  const onSubmit = handleSubmit((values) => {
    createPlace.mutate(
      {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        address: values.address.trim(),
        lat: values.lat,
        lng: values.lng,
        category: values.category,
        thumbnailUrl: values.thumbnailUrl?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpenCreate(false)
          reset()
          setTab('pending')
        },
      },
    )
  })

  return (
    <PublicSiteLayout>
      <main className="mt-24 mb-16 flex-grow max-w-[1280px] mx-auto px-8">
        <div className="mb-6">
          <h1 className="font-display-lg text-display-lg text-primary mb-1">Manage Your Places</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Track and manage your submitted place requests for the Aether global network.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm mb-6 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <nav className="flex border-b border-outline-variant w-fit">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`px-4 py-2 font-label-bold text-label-bold ${
                    tab === item.key
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-secondary hover:text-on-surface-variant'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-grow min-w-[260px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Search by name or location..."
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <Button
                type="button"
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-bold text-label-bold uppercase flex items-center gap-1 hover:bg-primary-strong transition-colors"
                onClick={() => setOpenCreate(true)}
              >
                <span className="material-symbols-outlined">add_circle</span>
                Create Request
              </Button>
            </div>
          </div>
        </div>

        {placesQuery.isError && (
          <Alert variant="error" message="Failed to load your places." />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rows.map((item) => (
            <article
              key={item.id}
              className={`bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant hover:shadow-xl transition-all ${
                item.status === 'rejected' ? 'opacity-80' : ''
              }`}
            >
              <div className={`h-48 relative ${item.status === 'rejected' ? 'grayscale' : ''}`}>
                <img
                  className="w-full h-full object-cover"
                  src={item.imageUrl || item.thumbnailUrl || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=900&q=80'}
                  alt={item.name}
                />
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full font-label-bold text-caption flex items-center gap-1 backdrop-blur-md ${
                    item.status === 'published'
                      ? 'bg-tertiary/10 text-tertiary-fixed-dim'
                      : item.status === 'pending'
                        ? 'bg-secondary/10 text-secondary-container'
                        : 'bg-error/10 text-error'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'published'
                        ? 'bg-tertiary'
                        : item.status === 'pending'
                          ? 'bg-secondary'
                          : 'bg-error'
                    }`}
                  />
                  {item.status.toUpperCase()}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-headline-md text-headline-md ${item.status === 'rejected' ? 'text-secondary line-through' : 'text-primary'}`}>
                    {item.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant font-body-md text-body-md mb-4">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {item.address}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                  <div className="text-secondary font-caption text-caption uppercase">
                    ID: {item.id.slice(0, 8)}
                  </div>
                  {item.status === 'rejected' && (
                    <span className="text-error font-label-bold text-caption uppercase">
                      {item.deletedReason ?? 'Rejected'}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {!placesQuery.isLoading && rows.length === 0 && (
          <div className="mt-8 rounded-xl border border-outline-variant bg-white p-8 text-center text-on-surface-variant">
            No place requests found.
          </div>
        )}
      </main>

      {openCreate && (
        <div className="fixed inset-0 z-[70] bg-scrim/40 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-primary">Create Place Request</h2>
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="font-label-caps text-[11px] tracking-wider text-on-surface-variant hover:text-primary"
              >
                CLOSE ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="px-6 py-4 space-y-4" noValidate>
              {createPlace.isError && (
                <Alert variant="error" message={getApiError(createPlace.error)} />
              )}

              <div className="grid grid-cols-2 gap-4">
                <DynamicFormFields
                  fields={[
                    { name: 'name', label: 'NAME', type: 'text', placeholder: 'Place name', wrapperClassName: 'col-span-1' },
                    { name: 'category', label: 'CATEGORY', type: 'select', wrapperClassName: 'col-span-1', options: (categoriesQuery.data ?? []).map((c) => ({ value: c.id, label: c.name })) },
                  ]}
                  register={register}
                  errors={errors}
                />
              </div>

              <DynamicFormFields
                fields={[{ name: 'address', label: 'ADDRESS', type: 'text', placeholder: 'Full address' }]}
                register={register}
                errors={errors}
              />

              <div className="grid grid-cols-2 gap-4">
                <DynamicFormFields
                  fields={[
                    { name: 'lat', label: 'LATITUDE', type: 'text', placeholder: 'e.g. 10.7769', wrapperClassName: 'col-span-1' },
                    { name: 'lng', label: 'LONGITUDE', type: 'text', placeholder: 'e.g. 106.7009', wrapperClassName: 'col-span-1' },
                  ]}
                  register={register}
                  errors={errors}
                />
              </div>

              <DynamicFormFields
                fields={[
                  { name: 'thumbnailUrl', label: 'THUMBNAIL URL', type: 'text', placeholder: 'https://...' },
                  { name: 'imageUrl', label: 'IMAGE URL', type: 'text', placeholder: 'https://...' },
                  { name: 'description', label: 'DESCRIPTION', type: 'textarea', placeholder: 'Optional description...' },
                ]}
                register={register}
                errors={errors}
              />

              <div className="pt-2 flex gap-3">
                <Button type="submit" isLoading={createPlace.isPending} fullWidth>
                  CREATE REQUEST
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicSiteLayout>
  )
}
