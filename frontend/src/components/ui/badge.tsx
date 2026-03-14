import * as React from 'react'

const badgeVariants = {
  default:
    'border-slate-700 bg-slate-800 text-slate-200',
  secondary:
    'border-slate-700 bg-slate-800/60 text-slate-400',
  outline: 'border-slate-600 text-slate-300',
  success: 'border-emerald-800 bg-emerald-900/40 text-emerald-300',
  warning: 'border-amber-700 bg-amber-900/40 text-amber-300',
  destructive: 'border-red-800 bg-red-900/40 text-red-300',
} as const

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors ${badgeVariants[variant]} ${className}`}
      {...props}
    />
  )
}

export { Badge }
