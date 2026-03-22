import React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, Toast as ToastType, ToastVariant } from '../../stores/toastStore'

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; styles: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    styles: 'border-success/30 bg-background-card',
    iconColor: 'text-success',
  },
  error: {
    icon: <XCircle size={18} />,
    styles: 'border-danger/30 bg-background-card',
    iconColor: 'text-danger',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    styles: 'border-warning/30 bg-background-card',
    iconColor: 'text-warning',
  },
  info: {
    icon: <Info size={18} />,
    styles: 'border-info/30 bg-background-card',
    iconColor: 'text-info',
  },
}

const ToastItem: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const config = variantConfig[toast.variant]

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-card
        animate-slide-in-right min-w-[280px] max-w-[400px]
        ${config.styles}
      `}
    >
      <span className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>{config.icon}</span>
      <p className="flex-1 text-sm text-text-primary font-body leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}
