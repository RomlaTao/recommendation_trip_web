import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { AdminGuard } from '@/components/guards/AdminGuard'

// Auth routes
import HomeRoute from './routes/home'
import LoginRoute from './routes/auth/login'
import RegisterRoute from './routes/auth/register'
import ForgotPasswordRoute from './routes/auth/forgot-password'
import ResetPasswordRoute from './routes/auth/reset-password'
import VerifyEmailRoute from './routes/auth/verify-email'

// Account (self-service) routes
import AccountProfileRoute from './routes/account/profile'
import AccountSettingsRoute from './routes/account/settings'

// Public profile route
import PublicProfileRoute from './routes/users/public-profile'
import PlacesSearchRoute from './routes/places/search'
import PlaceDetailRoute from './routes/places/detail'
import MyPlacesRoute from './routes/places/my-places'
import TripsRoute from './routes/trips'
import TripDetailRoute from './routes/trips/detail'

// Admin routes
import AdminUsersRoute from './routes/admin/users/index'
import AdminDashboardRoute from './routes/admin/dashboard'
import AdminPlacesRoute from './routes/admin/places'
import AdminReviewsRoute from './routes/admin/reviews'
import AdminActivityLogsRoute from './routes/admin/activity-logs'

export const router = createBrowserRouter([
  // ─── Public ───────────────────────────────────────────────────────────────
  { path: '/', element: <HomeRoute /> },
  { path: '/login', element: <LoginRoute /> },
  { path: '/register', element: <RegisterRoute /> },
  { path: '/forgot-password', element: <ForgotPasswordRoute /> },
  { path: '/reset-password', element: <ResetPasswordRoute /> },
  { path: '/verify-email', element: <VerifyEmailRoute /> },

  // Public user profile (no auth required)
  { path: '/users/:username', element: <PublicProfileRoute /> },

  // ─── Protected (requires auth) ────────────────────────────────────────────
  {
    element: <AuthGuard />,
    children: [
      { path: '/account/profile', element: <AccountProfileRoute /> },
      { path: '/account/settings', element: <AccountSettingsRoute /> },

      { path: '/trips', element: <TripsRoute /> },
      { path: '/trips/:id', element: <TripDetailRoute /> },
      { path: '/places', element: <PlacesSearchRoute /> },
      { path: '/places/:id', element: <PlaceDetailRoute /> },
      { path: '/my-places', element: <MyPlacesRoute /> },

      // ─── Admin only ─────────────────────────────────────────────────────
      {
        element: <AdminGuard />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboardRoute /> },
          { path: '/admin/users', element: <AdminUsersRoute /> },
          { path: '/admin/places', element: <AdminPlacesRoute /> },
          { path: '/admin/reviews', element: <AdminReviewsRoute /> },
          { path: '/admin/activity-logs', element: <AdminActivityLogsRoute /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
