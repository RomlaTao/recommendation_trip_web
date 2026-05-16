import { type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { NotificationBell } from '@/components/ui/NotificationBell'

interface AdminLayoutProps {
  children?: ReactNode
}

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/users', label: 'Users', icon: 'group' },
  { to: '/admin/places', label: 'Places', icon: 'explore' },
  { to: '/admin/reviews', label: 'Reviews', icon: 'star_rate' },
  { to: '/admin/activity-logs', label: 'Activity Logs', icon: 'history' },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="fixed left-0 top-0 h-full w-[260px] z-50 bg-admin-sidebar border-r border-on-media/10 flex flex-col py-6">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 border border-on-media/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-media" style={{ fontVariationSettings: "'FILL' 1" }}>
                travel_explore
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-media uppercase tracking-wider">TravelAdmin</h1>
              <p className="text-[10px] text-on-media/50 font-medium tracking-widest uppercase">Suite v2.4</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-4 py-3 text-sm transition-all ${
                  isActive ? 'border-l-4 border-success bg-success/10 text-on-media font-semibold' : 'text-on-media/80 hover:text-on-media hover:bg-on-media/5'
                }`
              }
            >
              <span className="material-symbols-outlined mr-3 text-success">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-6 pt-6 border-t border-on-media/10">
          <div className="flex items-center py-3 text-on-media/80">
            <span className="material-symbols-outlined mr-3 text-success">account_circle</span>
            <span>Profile Settings</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 ml-[260px]">
        <header className="fixed top-0 right-0 w-[calc(100%-260px)] z-40 h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="text-lg font-black text-primary">Admin Suite</div>
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <NotificationBell className="relative" />
            <button className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-colors" type="button">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-px bg-outline-variant mx-2" />
            <div className="text-right">
              <p className="text-xs font-bold text-primary">{user?.username ?? 'Admin Suite'}</p>
              <p className="text-[10px] text-success">System Administrator</p>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="text-sm font-semibold text-error hover:underline"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="pt-16">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
