import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, Package, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useProducts,
  useDeleteProduct,
} from '../hooks/useProducts'
import { formatPrice } from '../lib/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import type { Product } from '../types/api.types'

const CATEGORIES = ['All', 'Electronics', 'Books', 'Clothing', 'Sports', 'Home'] as const

function StockIndicator({ stockCount }: { stockCount: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          stockCount > 50
            ? 'bg-emerald-500'
            : stockCount >= 10
              ? 'bg-amber-500'
              : 'bg-red-500'
        }`}
        aria-hidden
      />
      <span>{stockCount}</span>
    </span>
  )
}

function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') ?? 'All'
  const category =
    categoryParam === 'All' || !CATEGORIES.includes(categoryParam as (typeof CATEGORIES)[number])
      ? undefined
      : categoryParam
  const [page] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [cachePanelOpen, setCachePanelOpen] = useState(false)

  const { data, isLoading, isFetching, isStale, dataUpdatedAt } = useProducts(
    category,
    page
  )
  const deleteProduct = useDeleteProduct()

  const products = data?.content ?? []
  const totalElements = data?.totalElements ?? 0

  const handleCategoryChange = (cat: string) => {
    setSearchParams(cat === 'All' ? {} : { category: cat })
  }

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteProduct.mutate(deleteId, {
        onSuccess: () => {
          toast.success('Product deleted')
          setDeleteId(null)
        },
        onError: () => toast.error('Failed to delete product'),
      })
    }
  }

  const cacheStatus =
    !isFetching && !isStale ? 'cached' : isFetching ? 'refetching' : 'stale'

  return (
    <div className="space-y-6">
      {/* Header + count + category tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-100">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            <span className="font-medium text-slate-300">{totalElements}</span>{' '}
            products
          </p>
        </div>

        {/* Cache observation panel — collapsible, top right */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
            <button
              type="button"
              onClick={() => setCachePanelOpen((o) => !o)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
            >
              TanStack Query cache
              <ChevronDown
                className={`h-4 w-4 transition-transform ${cachePanelOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {cachePanelOpen && (
              <div className="mt-2 flex items-center gap-2 border-t border-slate-700 pt-2">
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                    cacheStatus === 'cached'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {cacheStatus === 'cached'
                    ? 'Cached'
                    : cacheStatus === 'refetching'
                      ? 'Refetching'
                      : 'Stale'}
                </span>
                <span className="text-xs text-slate-500">
                  Data age: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              (cat === 'All' && !category) || category === cat
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50">
        {isLoading ? (
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-slate-800 py-4 last:border-0">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full border border-slate-700 bg-slate-800/60 p-4">
              <Package className="h-10 w-10 text-slate-500" />
            </div>
            <p className="mt-4 text-lg font-medium text-slate-300">
              No products found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another category or refresh the list.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <TableCell className="font-medium text-slate-100">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell>
                    <StockIndicator
                      stockCount={product.inventory?.stockCount ?? 0}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(product.tags ?? []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(product.tags?.length ?? 0) > 3 && (
                        <span className="text-xs text-slate-500">
                          +{(product.tags?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(product.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-900/40 hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProductsPage
