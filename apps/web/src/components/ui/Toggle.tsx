import React from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  label?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
}) => {
  const sizeStyles = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  }

  const s = sizeStyles[size]

  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex items-center rounded-full transition-all duration-200
          ${s.track}
          ${checked ? 'bg-gold-gradient shadow-glow' : 'bg-background-elevated border border-border'}
          ${!disabled ? 'hover:opacity-90' : ''}
        `}
      >
        <span
          className={`
            absolute rounded-full bg-white shadow-sm transition-transform duration-200
            ${s.thumb}
            ${checked ? s.translate : 'translate-x-0.5'}
          `}
        />
      </div>
      {label && (
        <span className="text-sm text-text-secondary font-body select-none">{label}</span>
      )}
    </label>
  )
}
