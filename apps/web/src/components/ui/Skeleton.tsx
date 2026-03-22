import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  circle = false,
}) => {
  return (
    <div
      className={`
        skeleton-shimmer
        ${circle ? 'rounded-full' : rounded ? 'rounded-lg' : 'rounded'}
        ${className}
      `}
      style={{
        width: width,
        height: height ?? 16,
        minWidth: width,
      }}
    />
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-background-card border border-border rounded-card p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1">
          <Skeleton className="mb-2" height={14} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <Skeleton className="mb-2" height={12} />
      <Skeleton className="mb-2" height={12} width="80%" />
      <Skeleton height={12} width="60%" />
    </div>
  )
}

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="w-full">
      <div className="flex gap-4 mb-3 px-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={12} className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 items-center px-4 py-3 border-b border-border-subtle"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              height={14}
              className="flex-1"
              width={colIdx === 0 ? '30%' : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
