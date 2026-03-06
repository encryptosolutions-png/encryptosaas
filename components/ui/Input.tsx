import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export function Input({ label, error, helpText, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>}
      <input
        {...props}
        className={`w-full rounded-xl border bg-slate-900/80 px-4 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-700'
        } ${className}`}
      />
      {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
      {helpText && <p className="mt-1 text-sm text-slate-500">{helpText}</p>}
    </div>
  )
}
