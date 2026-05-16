import { getApiBaseUrl } from '@/core/api/base-url'

export const env = {
  get API_BASE_URL(): string {
    return getApiBaseUrl()
  },
  MAPBOX_ACCESS_TOKEN: (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined) ?? '',
  /** Base URL including `/api/v1` — e.g. `http://localhost:8001/api/v1` */
  RERANK_API_BASE_URL:
    (import.meta.env.VITE_RERANK_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
    'http://localhost:8001/api/v1',
} as const
