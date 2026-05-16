import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  rightLabel?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightLabel, type, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="space-y-unit">
        <div className="flex justify-between items-center">
          <label className="font-label-caps text-label-caps text-on-surface-variant block">{label}</label>
          {rightLabel}
        </div>

        <div className="relative">
          <input
            ref={ref}
            type={resolvedType}
            className={`w-full px-4 py-3 bg-surface-container-lowest border ${
              error ? 'border-error' : 'border-outline-variant'
            } rounded-none focus:outline-none focus:border-primary transition-colors duration-300 font-body-md ${
              isPassword ? 'pr-12' : ''
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-caps text-[10px] tracking-wider"
              tabIndex={-1}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          )}
        </div>

        {error ? <p className="font-label-caps text-[11px] text-error mt-1">{error}</p> : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
