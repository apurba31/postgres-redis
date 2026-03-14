import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, ShoppingCart, Star } from 'lucide-react'
import { formatRelativeTime } from '../lib/format'
import { useProduct } from '../hooks/useProducts'
import { formatPrice } from '../lib/format'
import { authStore } from '../store/authStore'
import { api } from '../lib/axios'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'

function StockIndicator({ stockCount }: { stockCount: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block h-3 w-3 rounded-full ${
          stockCount > 50
            ? 'bg-emerald-500'
            : stockCount >= 10
              ? 'bg-amber-500'
              : 'bg-red-500'
        }`}
        aria-hidden
      />
      <span className="font-medium">{stockCount}</span>
      <span className="text-slate-400">in stock</span>
    </span>
  )
}

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = authStore((s) => s.user)
  const { data: product, isLoading } = useProduct(id ?? '')

  // Track view on mount
  useEffect(() => {
    if (!id || !user?.id) return
    api
      .post(`/api/cart/${user.id}/view/${id}`)
      .catch(() => {})
  }, [id, user?.id])

  const handleAddToCart = () => {
    if (!user?.id || !product?.id) return
    api
      .post(`/api/cart/${user.id}/items`, {
        productId: product.id,
        quantity: 1,
      })
      .then(() => {
        navigate('/cart')
      })
      .catch(() => {})
  }

  if (!id) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-100">
        Invalid product
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-96" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-100">
        Product not found
      </div>
    )
  }

  const stockCount = product.inventory?.stockCount ?? 0

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/products" className="hover:text-slate-200">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-200">{product.name}</span>
      </nav>

      {/* Hero */}
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-100">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{product.category}</Badge>
          <span className="text-2xl font-semibold text-slate-100">
            {formatPrice(product.price)}
          </span>
        </div>
      </header>

      {/* Two column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left 60% */}
        <div className="space-y-8">
          {/* Attributes */}
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
              Attributes
            </h2>
            <pre className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-4 font-mono text-sm text-slate-300">
              {Object.entries(product.attributes ?? {}).length > 0
                ? JSON.stringify(product.attributes, null, 2)
                : '{}'}
            </pre>
          </section>

          {/* Tags */}
          {product.tags?.length ? (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          {/* Reviews */}
          {product.reviews?.length ? (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
                Reviews
              </h2>
              <div className="space-y-3">
                {product.reviews.map((review, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(new Date(review.reviewDate), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Right 40% */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
            <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Inventory
            </h3>
            <div className="mt-3">
              <StockIndicator stockCount={stockCount} />
            </div>
            {product.inventory?.warehouseLocation && (
              <p className="mt-2 text-sm text-slate-400">
                Warehouse: {product.inventory.warehouseLocation}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stockCount < 1}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to cart
          </button>
        </aside>
      </div>

      {/* Cache hit indicator — expandable panel at bottom */}
      <details className="rounded-lg border border-slate-700 bg-slate-900/50">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200">
          Cache info
        </summary>
        <div className="border-t border-slate-700 px-4 py-3 text-sm text-slate-500">
          <p>
            This product was served from Redis cache when applicable. Last
            updated:{' '}
            <span className="text-slate-300">
              {product.lastUpdated
                ? formatRelativeTime(new Date(product.lastUpdated), { addSuffix: true })
                : '—'}
            </span>
          </p>
        </div>
      </details>
    </div>
  )
}

export default ProductDetailPage
