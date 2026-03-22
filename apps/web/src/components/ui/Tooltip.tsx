import React, { useState } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const positionStyles = {
  top: {
    container: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-background-elevated border-l-transparent border-r-transparent border-b-transparent',
  },
  bottom: {
    container: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-background-elevated border-l-transparent border-r-transparent border-t-transparent',
  },
  left: {
    container: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-l-background-elevated border-t-transparent border-b-transparent border-r-transparent',
  },
  right: {
    container: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-background-elevated border-t-transparent border-b-transparent border-l-transparent',
  },
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [visible, setVisible] = useState(false)
  const pos = positionStyles[position]

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`
            absolute z-50 ${pos.container}
            px-2.5 py-1.5 rounded-lg
            bg-background-elevated border border-border
            text-xs text-text-primary font-body whitespace-nowrap
            shadow-card pointer-events-none
            animate-fade-in
          `}
        >
          {content}
        </div>
      )}
    </div>
  )
}
