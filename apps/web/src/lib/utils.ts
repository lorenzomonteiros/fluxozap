import { format, formatDistanceToNow, parseISO } from 'date-fns'

type ClassValue = string | number | boolean | undefined | null | ClassValue[]

function flattenClassValues(inputs: ClassValue[]): (string | number)[] {
  const result: (string | number)[] = []
  for (const input of inputs) {
    if (Array.isArray(input)) {
      result.push(...flattenClassValues(input))
    } else if (input != null && input !== false) {
      result.push(input as string | number)
    }
  }
  return result
}

export function cn(...inputs: ClassValue[]): string {
  return flattenClassValues(inputs).filter(Boolean).join(' ').trim()
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt)
  } catch {
    return String(date)
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'MMM d, yyyy HH:mm')
  } catch {
    return String(date)
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return String(date)
  }
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    connected: 'text-success',
    disconnected: 'text-text-secondary',
    connecting: 'text-warning',
    qr_ready: 'text-info',
    running: 'text-info',
    completed: 'text-success',
    failed: 'text-danger',
    active: 'text-success',
    inactive: 'text-text-secondary',
    sent: 'text-success',
    pending: 'text-warning',
    delivered: 'text-info',
    read: 'text-gold',
  }
  return map[status] ?? 'text-text-secondary'
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    connecting: 'Connecting',
    qr_ready: 'QR Ready',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
  }
  return map[status] ?? status
}
