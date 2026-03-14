import { Link } from 'react-router-dom'
import { Package, Database, Zap, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { authStore } from '../store/authStore'
import { useProductIds } from '../hooks/useProducts'
import { useCacheStatus } from '../hooks/useBenchmark'
import { useRunBenchmark } from '../hooks/useBenchmark'
import { useCart, useCartViewed } from '../hooks/useCart'
import { Skeleton } from '../components/ui/skeleton'

const LAST_BENCHMARK_KEY = 'redis-demo-last-benchmark-speedup'

function DashboardPage() {
  const user = authStore((s) => s.user)
  const userId = user?.id

  const { data: productIds = [], isLoading: productsLoading } = useProductIds()
  const { data: cacheStatusList = [] } = useCacheStatus()
  const { data: cartItems = [] } = useCart(userId)
  const { data: viewedIds = [] } = useCartViewed(userId)
  const runBenchmark = useRunBenchmark()

  const activeCacheEntries = cacheStatusList.reduce(
    (sum, c) => sum + (c.keyCount ?? 0),
    0
  )
  const lastSpeedup =
    typeof window !== 'undefined'
      ? localStorage.getItem(LAST_BENCHMARK_KEY)
      : null
  const speedupNum = lastSpeedup != null ? parseFloat(lastSpeedup) : null

  const handleQuickBenchmark = () => {
    runBenchmark.mutate(10, {
      onSuccess: (result) => {
        localStorage.setItem(
          LAST_BENCHMARK_KEY,
          String(result.speedupFactor)
        )
        toast.success(`Benchmark complete: ${result.speedupFactor.toFixed(1)}x speedup`)
      },
      onError: () => toast.error('Benchmark failed'),
    })
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold text-slate-100">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-400">
          Overview of your Redis-backed data
        </p>
      </header>

      {/* Stat row — 4 cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Total Products</span>
          </div>
          {productsLoading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-100">
              {productIds.length}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Database className="h-5 w-5" />
            <span className="text-sm font-medium">Active Cache Entries</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-100">
            {activeCacheEntries}
          </p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-medium">Last Benchmark Speedup</span>
          </div>
          {speedupNum != null ? (
            <p className="mt-2 text-2xl font-bold tabular-nums text-amber-400">
              {speedupNum.toFixed(1)}x
            </p>
          ) : (
            <p className="mt-2 text-slate-500">—</p>
          )}
          <button
            type="button"
            onClick={handleQuickBenchmark}
            disabled={runBenchmark.isPending}
            className="mt-2 text-sm text-blue-400 hover:underline disabled:opacity-50"
          >
            {runBenchmark.isPending
              ? 'Running…'
              : 'Run quick benchmark (10 iterations)'}
          </button>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm font-medium">Cart Items</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-100">
            {cartItems.length}
          </p>
          <Link
            to="/cart"
            className="mt-2 inline-block text-sm text-blue-400 hover:underline"
          >
            View cart
          </Link>
        </div>
      </div>

      {/* Recent activity — recently viewed */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Recent activity
        </h2>
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          {!userId ? (
            <p className="text-sm text-slate-500">Sign in to see recently viewed products.</p>
          ) : (viewedIds as string[]).length === 0 ? (
            <p className="text-sm text-slate-500">No recently viewed products.</p>
          ) : (
            <ul className="space-y-2">
              {(viewedIds as string[]).slice(0, 10).map((id) => (
                <li key={id}>
                  <Link
                    to={`/products/${id}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Product {id}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
