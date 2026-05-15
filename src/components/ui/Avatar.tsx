interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
}

function initials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={`${sizes[size]} rounded-full object-cover bg-surface-container`}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps font-bold select-none`}
      aria-label={name ?? 'avatar'}
    >
      {initials(name)}
    </div>
  )
}
