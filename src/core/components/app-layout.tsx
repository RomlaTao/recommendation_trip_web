import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Recommendation Trip</h1>
        <nav className="app-nav">
          <NavLink className="app-link" to="/login">
            Login
          </NavLink>
          <NavLink className="app-link" to="/trips">
            My Trips
          </NavLink>
          <NavLink className="app-link" to="/trips/public">
            Public Trips
          </NavLink>
          <NavLink className="app-link" to="/places">
            Places
          </NavLink>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
