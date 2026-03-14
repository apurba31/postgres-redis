import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { authStore } from '../store/authStore'
import {
  useCart,
  useCartTotal,
  useCartViewed,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from '../hooks/useCart'
import { formatPrice } from '../lib/format'
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
import { Skeleton } from '../components/ui/skeleton'

function CartPage() {
  const user = authStore((s) => s.user)
  const userId = user?.id
  const [clearCartOpen, setClearCartOpen] = useState(false)
  const [removeProductId, setRemoveProductId] = useState<string | null>(null)

  const { data: items = [], isLoading } = useCart(userId)
  const { data: total = 0, isLoading: totalLoading } = useCartTotal(userId)
  const { data: viewedIds = [] } = useCartViewed(userId)
  const updateItem = useUpdateCartItem(userId)
  const removeItem = useRemoveCartItem(userId)
  const clearCart = useClearCart(userId)

  const handleQuantityChange = (productId: string, delta: number, currentQty: number) => {
    const newQty = currentQty + delta
    if (newQty < 0) return
    updateItem.mutate(
      { productId, quantity: newQty },
      {
        onSuccess: () => toast.success('Cart updated'),
        onError: () => toast.error('Failed to update cart'),
      }
    )
  }

  const handleRemove = (productId: string) => {
    setRemoveProductId(productId)
  }

  const confirmRemove = () => {
    if (removeProductId) {
      removeItem.mutate(removeProductId, {
        onSuccess: () => {
          toast.success('Item removed')
          setRemoveProductId(null)
        },
        onError: () => toast.error('Failed to remove item'),
      })
    }
  }

  const handleClearCart = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => {
        toast.success('Cart cleared')
        setClearCartOpen(false)
      },
      onError: () => toast.error('Failed to clear cart'),
    })
  }

  if (!userId) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-100">
        Please sign in to view your cart.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-slate-100">
        Cart
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Left — Cart items */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4"
                >
                  <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 py-16">
              <ShoppingCart className="h-12 w-12 text-slate-500" />
              <p className="mt-4 text-lg font-medium text-slate-300">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add products from the Products page.
              </p>
              <Link
                to="/products"
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-4 sm:flex-nowrap"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-medium text-slate-100 hover:text-blue-400"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {formatPrice(item.unitPrice)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          -1,
                          item.quantity
                        )
                      }
                      disabled={item.quantity <= 1 || updateItem.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center font-medium tabular-nums text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          1,
                          item.quantity
                        )
                      }
                      disabled={updateItem.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="w-full text-right font-medium text-slate-200 sm:w-auto">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    className="rounded p-2 text-slate-400 hover:bg-red-900/30 hover:text-red-400"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Total + Clear cart */}
          {items.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              {totalLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-xl font-semibold text-slate-100">
                  Total: {formatPrice(total)}
                </p>
              )}
              <button
                type="button"
                onClick={() => setClearCartOpen(true)}
                disabled={clearCart.isPending}
                className="mt-3 text-sm text-slate-400 underline hover:text-red-400 disabled:opacity-50"
              >
                Clear cart
              </button>
            </div>
          )}
        </div>

        {/* Right — Recently viewed */}
        <aside className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-500">
            <Clock className="h-4 w-4" />
            Recently Viewed
          </h2>
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            {viewedIds.length === 0 ? (
              <p className="text-sm text-slate-500">
                No recently viewed products.
              </p>
            ) : (
              <ul className="space-y-2">
                {(viewedIds as string[]).slice(0, 10).map((id) => (
                  <li key={id}>
                    <Link
                      to={`/products/${id}`}
                      className="text-sm text-blue-400 hover:underline"
                    >
                      {id}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Redis context note */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-400">
            <p>
              Your cart is stored in Redis as a Hash. It expires in 24 hours.
            </p>
            <p className="mt-1">
              Each item is a hash field. Real-time total is computed on the
              server.
            </p>
          </div>
        </aside>
      </div>

      {/* Clear cart confirmation */}
      <AlertDialog open={clearCartOpen} onOpenChange={setClearCartOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items from your cart. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCart}>
              Clear cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove item confirmation */}
      <AlertDialog open={!!removeProductId} onOpenChange={(o) => !o && setRemoveProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item?</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be removed from your cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CartPage
