import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAdminUsers } from '@/features/users/hooks/admin/useAdminUsers'
import { useAdminDeleteUser } from '@/features/users/hooks/admin/useAdminMutations'
import type { AdminUsersQuery, UserProfile } from '@/features/users/types/users.types'

interface Props {
  onEdit: (user: UserProfile) => void
  onForcePassword: (user: UserProfile) => void
}

const roleBadge: Record<string, string> = {
  admin: 'bg-primary text-on-primary',
  partner: 'bg-primary-container text-on-primary-container',
  user: 'bg-secondary-container text-on-secondary-container',
}

export function UserTable({ onEdit, onForcePassword }: Props) {
  const [query, setQuery] = useState<AdminUsersQuery>({ page: 1, pageSize: 10 })
  const { data, isLoading, isError } = useAdminUsers(query)
  const deleteUser = useAdminDeleteUser()

  const [keyword, setKeyword] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery((q) => ({ ...q, page: 1, keyword: keyword.trim() || undefined }))
  }

  function handleDelete(user: UserProfile) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    deleteUser.mutate(user.id)
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="p-6 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
        <div className="flex border border-outline-variant rounded-lg overflow-hidden">
          {(['all', 'user', 'admin', 'partner'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() =>
                setQuery((q) => ({
                  ...q,
                  page: 1,
                  role: r === 'all' ? undefined : r as AdminUsersQuery['role'],
                }))
              }
              className={`px-4 py-2 text-sm border-r last:border-r-0 border-outline-variant transition-colors ${
                (r === 'all' && !query.role) || query.role === r
                  ? 'bg-surface-container-low text-primary font-semibold'
                  : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              {r === 'all' ? 'All Users' : r === 'admin' ? 'Administrators' : r === 'partner' ? 'Partners' : 'Users'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search username or email..."
            className="w-72 max-w-[55vw] px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-secondary"
          />
          <Button type="submit" className="py-2 px-4 text-xs">
            SEARCH
          </Button>
        </form>
      </div>

      {deleteUser.isError && <Alert variant="error" message="Failed to delete user." />}

      {isLoading && (
        <div className="font-body-md text-on-surface-variant text-center py-8">Loading users...</div>
      )}
      {isError && <Alert variant="error" message="Failed to load users." />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">Identity</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">Credential Path</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">Clearance</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant">Authorization</th>
                  <th className="px-6 py-4 font-label-caps text-label-caps text-secondary uppercase tracking-widest border-b border-outline-variant text-right">Commands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {data.list.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatarUrl} name={user.username} size="md" />
                        <div>
                          <p className="font-bold text-slate-900">{user.username}</p>
                          <p className="text-xs text-secondary">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-data-tabular text-on-surface-variant">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${roleBadge[user.role] ?? ''}`}>
                        {user.role === 'admin'
                          ? 'ADMINISTRATOR'
                          : user.role === 'partner'
                            ? 'PARTNER'
                            : 'OPERATOR'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${user.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-secondary' : 'bg-slate-300'}`} />
                        <span className="text-sm font-bold">
                          {user.isActive ? 'ACTIVE' : 'LOCKED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-secondary-container rounded transition-all"
                          aria-label={`Edit ${user.username}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onForcePassword(user)}
                          className="p-1.5 text-secondary hover:text-secondary hover:bg-surface-container-low rounded transition-all"
                          aria-label={`Set password for ${user.username}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-secondary hover:text-error hover:bg-error/5 rounded transition-all"
                          aria-label={`Delete ${user.username}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-outline-variant flex items-center justify-between">
            <span className="text-sm text-secondary">
              Showing{' '}
              <span className="font-bold text-primary">
                {Math.min(((query.page ?? 1) - 1) * (query.pageSize ?? 10) + 1, data.total)}
                -
                {Math.min((query.page ?? 1) * (query.pageSize ?? 10), data.total)}
              </span>{' '}
              of <span className="font-bold text-primary">{data.total}</span> users
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="py-2 px-4 text-xs"
                disabled={query.page === 1}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
              >
                PREV
              </Button>
              <Button
                variant="ghost"
                className="py-2 px-4 text-xs"
                disabled={(query.page ?? 1) * (query.pageSize ?? 10) >= data.total}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
              >
                NEXT
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
