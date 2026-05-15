import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'ghost'
  fullWidth?: boolean
}

export function Button({
  children,
  isLoading = false,
  variant = 'primary',
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'font-label-caps text-label-caps transition-all duration-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'py-4 px-6 bg-primary text-on-primary hover:bg-on-primary-fixed-variant scale-100 hover:scale-[1.01]',
    ghost:
      'py-3 px-6 border border-outline text-on-surface hover:bg-surface-container',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          PROCESSING...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
