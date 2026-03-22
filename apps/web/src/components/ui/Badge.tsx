import React from 'react'

type BadgeVariant = 'default' | 'gold' | 'success' | 'danger' | 'warning' | 'info' | 'secondary'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-background-elevated text-text-secondary border-border-subtle',
  gold: 'bg-gold-muted text-gold border-border',
  success: 'bg-success-muted text-success border-success/20',
  danger: 'bg-danger-muted text-danger border-danger/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  info: 'bg-info-muted text-info border-info/20',
  secondary: 'bg-background-elevated text-text-secondary border-border-subtle',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-text-muted',
  gold: 'bg-gold',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
  secondary: 'bg-text-muted',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  dot = false,
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5
        text-xs font-medium font-body
        rounded-full border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  )
}
