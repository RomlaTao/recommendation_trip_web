/** Postgres `time` / APIs often return `HH:mm:ss`; `<input type="time">` & calendar use `HH:mm`. */
export function normalizeWallTimeToHhmm(raw: unknown): string {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?/.exec(s)
  if (!m) return s.slice(0, 5)
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return s.slice(0, 5)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
