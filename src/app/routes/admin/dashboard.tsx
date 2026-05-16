import { AdminLayout } from '@/components/layouts/AdminLayout'
import { useAdminUsers } from '@/features/users/hooks/admin/useAdminUsers'
import { useAdminPendingPlaces } from '@/features/admin/hooks/useAdminPlaces'

export default function AdminDashboardRoute() {
  const users = useAdminUsers({ page: 1, pageSize: 1 })
  const pendingPlaces = useAdminPendingPlaces()

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Total Users" value={String(users.data?.total ?? '...')} />
          <Card title="Pending Places" value={String(pendingPlaces.data?.length ?? '...')} />
          <Card title="Moderation Queue" value={String((pendingPlaces.data?.length ?? 0) + 0)} />
        </div>
      </div>
    </AdminLayout>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-outline-variant p-5">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">{title}</p>
      <p className="mt-2 text-3xl font-bold text-on-surface">{value}</p>
    </div>
  )
}
