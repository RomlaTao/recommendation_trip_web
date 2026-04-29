import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'

export function ErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Unexpected application error.'

  return (
    <section className="panel">
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <button className="button" type="button" onClick={() => navigate('/login')}>
        Back to login
      </button>
    </section>
  )
}
