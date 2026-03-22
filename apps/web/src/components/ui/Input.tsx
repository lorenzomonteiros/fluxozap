import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth = false, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary font-body">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-background-elevated border rounded-lg
              text-text-primary placeholder-text-muted font-body text-sm
              transition-all duration-200 outline-none
              ${error ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger/30' : 'border-border-subtle focus:border-gold focus:ring-1 focus:ring-gold/20'}
              ${leftIcon ? 'pl-10' : 'pl-3'}
              ${rightIcon ? 'pr-10' : 'pr-3'}
              py-2.5 h-10
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger font-body">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted font-body">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, fullWidth = false, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary font-body">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full bg-background-elevated border rounded-lg
            text-text-primary placeholder-text-muted font-body text-sm
            transition-all duration-200 outline-none resize-y
            ${error ? 'border-danger focus:border-danger' : 'border-border-subtle focus:border-gold focus:ring-1 focus:ring-gold/20'}
            px-3 py-2.5 min-h-[80px]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-danger font-body">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted font-body">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
