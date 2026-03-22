import { useCallback } from 'react'
import { useToastStore, ToastVariant } from '../stores/toastStore'

export function useToast() {
  const { addToast, removeToast } = useToastStore()

  const toast = useCallback(
    ({
      message,
      variant = 'info',
      duration = 4000,
    }: {
      message: string
      variant?: ToastVariant
      duration?: number
    }) => {
      addToast({ message, variant, duration })
    },
    [addToast]
  )

  return { toast, removeToast }
}
