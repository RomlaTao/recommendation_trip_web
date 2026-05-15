import { Button } from '@/components/ui/Button'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-scrim/45 px-4">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant shadow-xl">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h3 className="font-headline-md text-headline-md text-primary">{title}</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            isLoading={isLoading}
            onClick={onConfirm}
            className={isDanger ? 'bg-error hover:bg-error px-5 py-3' : 'px-5 py-3'}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
