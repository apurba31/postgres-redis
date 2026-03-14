import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-200 ease-out">
      <Navbar />
      <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6">
        <ErrorBoundary>
          <div key={location.pathname} className="page-transition-enter">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
    </div>
  )
}
