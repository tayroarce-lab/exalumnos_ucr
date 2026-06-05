'use client'

import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
}

export default function Card({
  children,
  hoverEffect = true,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${
        hoverEffect
          ? 'hover:shadow-md hover:border-brand-celeste/40 hover:-translate-y-0.5 transition-all duration-200'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
