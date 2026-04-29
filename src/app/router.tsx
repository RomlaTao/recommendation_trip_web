import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/root-layout'
import { ErrorBoundary } from '@/core/components/error-boundary'
import { AuthGuard } from '@/features/auth/components/auth-guard'
import { LoginPage } from '@/pages/login'
import { PlacesExplorePage } from '@/pages/places/places-explore'
import { TripDetailPage } from '@/pages/trips/trip-detail'
import { TripsPage } from '@/pages/trips/trips'
import { TripsPublicPage } from '@/pages/trips/trips-public'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'trips',
        element: (
          <AuthGuard>
            <TripsPage />
          </AuthGuard>
        ),
      },
      {
        path: 'trips/public',
        element: (
          <AuthGuard>
            <TripsPublicPage />
          </AuthGuard>
        ),
      },
      {
        path: 'trips/:tripId',
        element: (
          <AuthGuard>
            <TripDetailPage />
          </AuthGuard>
        ),
      },
      {
        path: 'places',
        element: (
          <AuthGuard>
            <PlacesExplorePage />
          </AuthGuard>
        ),
      },
    ],
  },
])
