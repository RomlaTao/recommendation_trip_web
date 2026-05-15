interface AlertProps {
  variant: 'error' | 'success' | 'info'
  message: string
}

const styles = {
  error: 'bg-error-container text-on-error-container border border-error/20',
  success: 'bg-surface-container-low text-on-surface border border-outline-variant',
  info: 'bg-surface-container text-on-surface border border-outline-variant',
}

export function Alert({ variant, message }: AlertProps) {
  return (
    <div className={`px-4 py-3 font-body-md text-sm rounded ${styles[variant]}`} role="alert">
      {message}
    </div>
  )
}
