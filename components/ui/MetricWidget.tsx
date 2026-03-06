import Link from 'next/link'
import React from 'react'

interface MetricWidgetProps {
  label: string
  value: string | number
  icon: React.ReactNode
  href?: string
  linkLabel?: string
}

export function MetricWidget({
  label,
  value,
  icon,
  href,
  linkLabel = 'Open',
}: MetricWidgetProps) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-2 text-cyan-300">
          {icon}
        </span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {href && (
        <Link
          href={href}
          className="mt-3 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
