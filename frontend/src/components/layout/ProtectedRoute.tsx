import { Navigate, Outlet } from 'react-router-dom'
import { authStore } from '../../store/authStore'

export function ProtectedRoute() {
  const isAuthenticated = authStore((s) => s.isAuthenticated)
  const authLoading = authStore((s) => s.authLoading)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
