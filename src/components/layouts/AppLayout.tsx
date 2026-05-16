import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/features/auth/store'
import { useLogout } from '@/features/auth/hooks/useLogout'

interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-label-caps text-[11px] tracking-wider transition-colors duration-200 ${
      isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
    }`

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Top nav */}
      <header className="sticky top-0 z-40 w-full bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-screen-xl mx-auto px-gutter h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link
            to="/"
            className="text-xl font-bold tracking-[0.3em] text-primary select-none shrink-0"
          >
            BUILDTRIP
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass}>HOMEPAGE</NavLink>
            <NavLink to="/trips" className={navLinkClass}>MY TRIPS</NavLink>
            <NavLink to="/places" className={navLinkClass}>EXPLORE</NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin/users" className={navLinkClass}>
                ADMIN
              </NavLink>
            )}
          </nav>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 focus:outline-none"
              aria-label="User menu"
            >
              <Avatar src={user?.avatarUrl ?? null} name={user?.username} size="sm" />
              <span className="hidden md:block font-label-caps text-[11px] tracking-wider text-on-surface-variant">
                {user?.username?.toUpperCase()}
              </span>
              <span className="text-on-surface-variant text-xs">▾</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant shadow-lg z-50">
                <Link
                  to="/account/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 font-label-caps text-[11px] tracking-wider text-on-surface hover:bg-surface-container transition-colors"
                >
                  MY PROFILE
                </Link>
                <Link
                  to="/account/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 font-label-caps text-[11px] tracking-wider text-on-surface hover:bg-surface-container transition-colors"
                >
                  SETTINGS
                </Link>
                <hr className="border-outline-variant" />
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); logout.mutate() }}
                  className="w-full text-left px-4 py-3 font-label-caps text-[11px] tracking-wider text-error hover:bg-error-container transition-colors"
                >
                  SIGN OUT
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>

      <footer className="w-full bg-footer border-t border-on-footer/15 py-8 px-6 flex justify-center">
        <span className="font-label-caps text-[11px] tracking-wider uppercase text-on-footer/70">
          BUILDTRIP © {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  )
}
