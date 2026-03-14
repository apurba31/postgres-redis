import { Link } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { formatPrice } from '../../lib/format'
import type { Product } from '../../types/api.types'

export interface ProductCardProps {
  product: Product
}

function StockIndicator({ stockCount }: { stockCount: number }) {
  const dotClass =
    stockCount > 50
      ? 'bg-emerald-500'
      : stockCount >= 10
        ? 'bg-amber-500'
        : 'bg-red-500'
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
      <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} aria-hidden />
      {stockCount} in stock
    </span>
  )
}

export function ProductCard({ product }: ProductCardProps) {
  const stockCount = product.inventory?.stockCount ?? 0

  return (
    <Link
      to={`/products/${product.id}`}
      className="block rounded-lg border border-slate-700 bg-slate-900/50 p-4 transition-colors hover:border-slate-600 hover:bg-slate-800/50"
    >
      <h3 className="font-medium text-slate-100">{product.name}</h3>
      <p className="mt-1 text-lg font-semibold text-slate-200">
        {formatPrice(product.price)}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="secondary">{product.category}</Badge>
        <StockIndicator stockCount={stockCount} />
      </div>
    </Link>
  )
}
