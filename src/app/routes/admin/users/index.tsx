import { useState } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/Button'
import { ForcePasswordModal } from '@/features/users/components/admin/ForcePasswordModal'
import { UserFormModal } from '@/features/users/components/admin/UserFormModal'
import { UserTable } from '@/features/users/components/admin/UserTable'
import type { UserProfile } from '@/features/users/types/users.types'

type Modal =
  | { type: 'create' }
  | { type: 'edit'; user: UserProfile }
  | { type: 'forcePassword'; user: UserProfile }
  | null

export default function AdminUsersRoute() {
  const [modal, setModal] = useState<Modal>(null)

  return (
    <AdminLayout>
      <div className="max-w-screen-xl mx-auto px-gutter py-stack-lg space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase">
              Directory / Users
            </p>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              User Management
            </h1>
          </div>
          <Button onClick={() => setModal({ type: 'create' })} className="py-2.5 px-6 text-xs">
            + CREATE USER
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-outline-variant p-5">
            <p className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase">
              Total Directory
            </p>
            <p className="mt-2 text-3xl font-bold text-on-surface">Users</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Real-time numbers are shown in table footer.
            </p>
          </div>
          <div className="bg-white border border-outline-variant p-5 md:col-span-2">
            <p className="font-label-caps text-[10px] tracking-widest text-on-surface-variant uppercase">
              Admin Console
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Manage roles, lock/unlock user access (via active status), and force password reset.
            </p>
          </div>
        </div>

        <UserTable
          onEdit={(user) => setModal({ type: 'edit', user })}
          onForcePassword={(user) => setModal({ type: 'forcePassword', user })}
        />

        {modal?.type === 'create' && (
          <UserFormModal onClose={() => setModal(null)} />
        )}
        {modal?.type === 'edit' && (
          <UserFormModal user={modal.user} onClose={() => setModal(null)} />
        )}
        {modal?.type === 'forcePassword' && (
          <ForcePasswordModal user={modal.user} onClose={() => setModal(null)} />
        )}
      </div>
    </AdminLayout>
  )
}
