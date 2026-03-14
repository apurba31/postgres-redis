import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { authStore } from '../../store/authStore'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/cart', label: 'Cart' },
  { to: '/benchmark', label: 'Benchmark' },
  { to: '/inspector', label: 'Inspector' },
]

function getInitials(user: unknown): string {
  if (user == null || typeof user !== 'object' || Array.isArray(user)) return '?'
  const u = user as Record<string, unknown>
  const name = u.name != null ? String(u.name).trim() : ''
  const email = u.email != null ? String(u.email).trim() : ''
  const source = name || email
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? ''
    const b = parts[1]?.[0] ?? ''
    const initials = (a + b).toUpperCase().slice(0, 2)
    if (initials) return initials
  }
  return source.slice(0, 2).toUpperCase() || '?'
}

export function Navbar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const user = authStore((s) => s.user)

  const handleLogout = async () => {
    setDropdownOpen(false)
    await authStore.getState().logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 transition-colors duration-200 ease-out">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: app name */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold text-slate-100 transition-colors duration-200 ease-out hover:text-slate-200"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />
          RedisDemo
        </NavLink>

        {/* Center: nav links (desktop) */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out ${
                  isActive
                    ? 'border-b-2 border-blue-400 text-blue-400'
                    : 'text-slate-400 hover:text-slate-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right: user menu */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-100 transition-colors duration-200 ease-out hover:bg-slate-700"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {getInitials(user)}
              </button>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-slate-700 bg-slate-900 py-1 transition-colors duration-200 ease-out">
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
                    >
                      Profile
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-100 hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-200 ease-out hover:bg-slate-800 hover:text-slate-100 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-800 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out ${
                    isActive
                      ? 'border-l-2 border-blue-400 bg-slate-800 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
