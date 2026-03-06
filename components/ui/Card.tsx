import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function Card({ children, title, subtitle, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`glass-panel rounded-2xl p-6 shadow-[0_10px_30px_rgba(2,6,23,0.45)] ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
