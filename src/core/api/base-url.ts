/**
 * API origin + prefix. Set `VITE_API_BASE_URL` in `.env` if Nest runs on another host/port
 * (must match `PORT` + `API_PREFIX` in recommendation_trip_platform, e.g. `http://localhost:3000/api/v1`).
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '')
  }
  return 'http://localhost:3000/api/v1'
}
