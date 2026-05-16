/**
 * Matches Nest {@link TransformInterceptor} success body shape.
 */
export type ApiSuccessEnvelope<T> = {
  code: number
  success: boolean
  message: string
  data: T
}

function isSuccessEnvelope<T>(raw: unknown): raw is ApiSuccessEnvelope<T> {
  if (!raw || typeof raw !== 'object') return false
  const o = raw as Record<string, unknown>
  return typeof o.success === 'boolean' && 'data' in o
}

/**
 * Unwraps Nest API success JSON. If the body is not an envelope, returns it as-is
 * (useful for tests or proxies).
 */
export function unwrapApiData<T>(raw: unknown): T {
  if (isSuccessEnvelope<T>(raw)) {
    return raw.data as T
  }
  return raw as T
}
