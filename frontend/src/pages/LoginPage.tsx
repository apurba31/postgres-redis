import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/axios'
import { authStore } from '../store/authStore'
import type { LoginResponse } from '../types/api.types'

/** Inlined Google G icon, 18×18 */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.711c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.959H.957C.347 6.174 0 7.548 0 9s.348 2.826.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.003 0 5.481 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.039-3.71z"
        fill="#EA4335"
      />
    </svg>
  )
}

/** Inlined GitHub mark, 18×18 */
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  // After OAuth redirect: ?auth=success → restore session and go to dashboard
  useEffect(() => {
    if (searchParams.get('auth') === 'success') {
      api
        .get('/api/auth/me')
        .then(({ data }) => {
          authStore.getState().login(data)
          navigate('/dashboard', { replace: true })
        })
        .catch(() => {
          toast.error('Could not restore session after sign-in.')
        })
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShake(false)
    try {
      const { data } = await api.post<LoginResponse>('/api/auth/login', {
        username: email,
        password,
      })
      authStore.getState().login(data.user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Sign-in failed. Check your email and password.'
      toast.error(message)
      setShake(true)
      setTimeout(() => setShake(false), 400)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left panel — decorative (hidden on mobile) */}
      <div className="hidden flex-1 flex-col justify-between bg-slate-950 p-10 md:flex lg:p-14">
        <div className="relative overflow-hidden rounded-xl">
          {/* Animated grid */}
          <div
            className="absolute inset-0 opacity-[0.15] animate-grid-pulse"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative space-y-8">
            <h1 className="font-display text-4xl font-semibold italic tracking-tight text-slate-100 lg:text-5xl">
              Cache fast, ship faster
            </h1>
            <div className="flex flex-wrap gap-3">
              {['47x faster reads', 'Sub-1ms latency', 'Redis 7'].map((label) => (
                <span
                  key={label}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-sm text-slate-300"
                >
                  {label}
                </span>
              ))}
            </div>
            {/* Request → [Redis] → Response diagram */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 font-mono text-sm">
              <span className="text-slate-400">Request</span>
              <span className="text-slate-500">→</span>
              <span className="rounded bg-slate-700 px-2 py-0.5 text-slate-200">Redis</span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-400">Response</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full flex-1 items-center justify-center bg-slate-900 p-4 md:max-w-[480px] md:flex-none md:p-8">
        <div
          className={`w-full max-w-sm animate-fade-in rounded-xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl ring-1 ring-slate-700/50 ${shake ? 'animate-shake' : ''}`}
        >
          {/* Logo + title */}
          <div className="mb-6 flex items-center gap-2">
            <span className="flex h-8 w-8 rounded-lg bg-red-500" aria-hidden />
            <span className="text-lg font-semibold text-slate-100">RedisDemo</span>
          </div>

          <h2 className="text-xl font-semibold text-slate-100">Sign in</h2>
          <p className="mt-1 text-sm text-slate-400">to your developer dashboard</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 pr-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-transform duration-150 hover:scale-[1.01] hover:bg-blue-500 disabled:scale-100 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-800 px-3 text-xs text-slate-500">or continue with</span>
            </div>
          </div>

          {/* OAuth */}
          <div className="flex flex-col gap-3">
            <a
              href="/oauth2/authorization/google"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-white py-2.5 font-medium text-slate-800 transition-transform duration-150 hover:scale-[1.01] hover:bg-slate-100"
            >
              <GoogleIcon />
              Google
            </a>
            <a
              href="/oauth2/authorization/github"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 py-2.5 font-medium text-slate-100 transition-transform duration-150 hover:scale-[1.01] hover:bg-slate-700"
            >
              <GitHubIcon />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
