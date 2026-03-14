const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatPrice(price: number): string {
  return currencyFormatter.format(price)
}

/** Relative time e.g. "5 minutes ago" — no date-fns dependency */
export function formatRelativeTime(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date()
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000)
  const abs = Math.abs(sec)
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
  const addSuffix = options?.addSuffix ?? true
  if (abs < 60) return rtf.format(addSuffix ? -sec : sec, 'second')
  if (abs < 3600) return rtf.format(addSuffix ? -Math.floor(sec / 60) : Math.floor(abs / 60), 'minute')
  if (abs < 86400) return rtf.format(addSuffix ? -Math.floor(sec / 3600) : Math.floor(abs / 3600), 'hour')
  if (abs < 2592000) return rtf.format(addSuffix ? -Math.floor(sec / 86400) : Math.floor(abs / 86400), 'day')
  if (abs < 31536000) return rtf.format(addSuffix ? -Math.floor(sec / 2592000) : Math.floor(abs / 2592000), 'month')
  return rtf.format(addSuffix ? -Math.floor(sec / 31536000) : Math.floor(abs / 31536000), 'year')
}
