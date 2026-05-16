import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { Avatar } from '@/components/ui/Avatar'
import { NotificationBell } from '@/components/ui/NotificationBell'

interface PublicSiteLayoutProps {
  children: ReactNode
  showConcierge?: boolean
}

export function PublicSiteLayout({ children, showConcierge = false }: PublicSiteLayoutProps) {
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="bg-background text-on-background antialiased font-body-md min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-12 h-24 bg-white/60 backdrop-blur-md border-b border-primary/5">
        <div className="text-2xl font-extrabold tracking-[0.5em] text-primary">AETHER</div>
        <nav className="hidden lg:flex items-center gap-12">
          <Link className="tracking-[0.25em] text-[10px] font-bold uppercase text-on-surface-variant hover:text-primary" to="/">HOMEPAGE</Link>
          <Link className="tracking-[0.25em] text-[10px] font-bold uppercase text-on-surface-variant hover:text-primary" to="/trips">MY TRIPS</Link>
          <Link className="tracking-[0.25em] text-[10px] font-bold uppercase text-on-surface-variant hover:text-primary" to="/places">CHATBOT</Link>
          <Link className="tracking-[0.25em] text-[10px] font-bold uppercase text-on-surface-variant hover:text-primary" to={isAuthenticated ? '/account/profile' : '/login'}>SOCIAL JOURNEY</Link>
        </nav>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <NotificationBell className="relative" />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 p-2 rounded-full hover:bg-primary/5 transition-colors"
                aria-label="Open user menu"
              >
                <Avatar src={user?.avatarUrl ?? null} name={user?.username} size="sm" />
                <span className="material-symbols-outlined text-primary text-[18px]">expand_more</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant shadow-xl z-50">
                  <Link
                  to="/my-places"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                >
                  MyPlace
                </Link>
                <Link
                    to="/account/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                  >
                    User Profile
                  </Link>
                  <Link
                    to="/account/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                  >
                    Account Setting
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      logout.mutate()
                    }}
                    className="w-full text-left px-4 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-error hover:bg-error-container transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <Link to="/login" className="material-symbols-outlined text-primary p-2 hover:bg-primary/5 rounded-full">account_circle</Link>
            <Link to="/login" className="tracking-[0.2em] text-[10px] font-bold uppercase text-on-primary bg-primary px-6 py-2.5 hover:bg-secondary">
              LOGIN
            </Link>
          </div>
        )}
      </header>

      {children}

      <footer className="w-full bg-footer text-on-footer py-24 border-t border-on-footer/10">
        <div className="max-w-7xl mx-auto px-12 grid grid-cols-2 md:grid-cols-4 gap-24 pt-12">
          <div className="col-span-2 space-y-10">
            <div className="text-3xl font-extrabold tracking-[0.5em] text-on-footer">AETHER</div>
            <p className="text-on-footer/60 text-[12px] max-w-sm font-medium leading-relaxed uppercase tracking-[0.25em]">
              Crafting the future of global travel through inspiration and elegance. Est 2024.
            </p>
          </div>
          <div className="space-y-8">
            <h4 className="text-on-footer text-[10px] font-bold tracking-[0.4em] uppercase">Services</h4>
            <ul className="space-y-5 text-[10px] uppercase tracking-[0.3em] text-on-footer/60 font-bold">
              <li><a className="hover:text-on-footer transition-colors" href="#">Luxury Stays</a></li>
              <li><a className="hover:text-on-footer transition-colors" href="#">Private Air</a></li>
              <li><a className="hover:text-on-footer transition-colors" href="#">Guided Expeditions</a></li>
              <li><a className="hover:text-on-footer transition-colors" href="#">Concierge</a></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-on-footer text-[10px] font-bold tracking-[0.4em] uppercase">Explore</h4>
            <ul className="space-y-5 text-[10px] uppercase tracking-[0.3em] text-on-footer/60 font-bold">
              <li><a className="hover:text-on-footer transition-colors" href="#">The Journal</a></li>
              <li><a className="hover:text-on-footer transition-colors" href="#">Membership</a></li>
              <li><a className="hover:text-on-footer transition-colors" href="#">Destinations</a></li>
              <li><a className="hover:text-on-footer transition-colors" href="#">Our Story</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {showConcierge && (
        <div className="fixed bottom-12 right-12 z-50">
          <button className="bg-primary text-on-primary w-16 h-16 flex items-center justify-center rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined">support_agent</span>
          </button>
        </div>
      )}
    </div>
  )
}
