import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatRelativeTime } from '../lib/format'
import { useRunBenchmark, useCacheStatus } from '../hooks/useBenchmark'
import type { BenchmarkResult } from '../types/api.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'

const HISTORY_SIZE = 5
const ITERATIONS_MIN = 10
const ITERATIONS_MAX = 500
const ITERATIONS_DEFAULT = 100

/** Dark tooltip for Recharts — accepts Recharts tooltip payload (value/label can be string | number) */
function ChartTooltip(props: {
  active?: boolean
  payload?: ReadonlyArray<{ name?: string | number; value?: number | string; color?: string }>
  label?: string | number
}) {
  const { active, payload, label } = props
  if (!active || !payload?.length) return null
  const entries = [...payload]
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 shadow-xl">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {String(label ?? '')}
      </p>
      <div className="space-y-1 text-sm">
        {entries.map((entry, i) => {
          const val = entry.value
          const valueStr =
            typeof val === 'number'
              ? `${val.toFixed(2)}ms`
              : Array.isArray(val)
                ? val.join(', ')
                : val != null
                  ? String(val)
                  : '—'
          return (
            <div key={String(entry.name ?? i)} className="flex items-center gap-2">
              {entry.color && (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-slate-300">
                {entry.name ?? '—'}: {valueStr}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BenchmarkPage() {
  const [iterations, setIterations] = useState(ITERATIONS_DEFAULT)
  const [displayResult, setDisplayResult] = useState<BenchmarkResult | null>(null)
  const [history, setHistory] = useState<Array<{ ranAt: string; result: BenchmarkResult }>>([])

  const runBenchmark = useRunBenchmark()
  const { data: cacheStatusList } = useCacheStatus()

  const handleRun = () => {
    runBenchmark.mutate(iterations, {
      onSuccess: (result) => {
        setDisplayResult(result)
        setHistory((prev) => {
          const next = [{ ranAt: result.ranAt, result }, ...prev]
          return next.slice(0, HISTORY_SIZE)
        })
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('redis-demo-last-benchmark-speedup', String(result.speedupFactor))
        }
      },
    })
  }

  const result = displayResult
  const isLoading = runBenchmark.isPending

  const chartData = result
    ? [
        { label: 'Avg', postgres: result.avgDbMs, redis: result.avgRedisMs },
        { label: 'p50 (median)', postgres: result.p50DbMs, redis: result.p50RedisMs },
        { label: 'p99', postgres: result.p99DbMs, redis: result.p99RedisMs },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-100">
          Redis vs Postgres
        </h1>
        <p className="mt-1 text-slate-400">
          Measure cache effectiveness in real time
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* Iteration slider */}
          <div className="flex items-center gap-3">
            <label htmlFor="iterations" className="text-sm font-medium text-slate-300">
              Iterations: {iterations}
            </label>
            <input
              id="iterations"
              type="range"
              min={ITERATIONS_MIN}
              max={ITERATIONS_MAX}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              disabled={isLoading}
              className="h-2 w-40 rounded-lg bg-slate-700 accent-blue-500 disabled:opacity-50"
            />
          </div>
          <p className="text-xs text-slate-500">
            Higher = more accurate p99
          </p>

          {/* Run button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-opacity hover:bg-blue-500 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-pulse rounded-full bg-white/80" />
                Running {iterations} iterations...
              </>
            ) : (
              'Run Benchmark'
            )}
          </button>
        </div>
      </header>

      {/* Results section — animate in after benchmark runs */}
      {result && (
        <div className="space-y-8">
          {/* Hero metric row — 3 stat cards with staggered fade-in */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div
              className="animate-fade-in rounded-lg border border-slate-700 border-l-4 border-l-amber-500 bg-slate-900/50 p-5"
              style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}
            >
              <p className="text-3xl font-bold tabular-nums text-amber-400">
                {result.speedupFactor.toFixed(1)}x
              </p>
              <p className="mt-1 text-sm text-slate-400">faster with Redis</p>
            </div>
            <div
              className="animate-fade-in rounded-lg border border-slate-700 border-l-4 border-l-red-500 bg-slate-900/50 p-5"
              style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
            >
              <p className="text-3xl font-bold tabular-nums text-red-400">
                {result.avgDbMs.toFixed(2)}ms
              </p>
              <p className="mt-1 text-sm text-slate-400">average Postgres read</p>
            </div>
            <div
              className="animate-fade-in rounded-lg border border-slate-700 border-l-4 border-l-emerald-500 bg-slate-900/50 p-5"
              style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
            >
              <p className="text-3xl font-bold tabular-nums text-emerald-400">
                {result.avgRedisMs.toFixed(2)}ms
              </p>
              <p className="mt-1 text-sm text-slate-400">average Redis read</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={{ stroke: '#1e293b' }}
                  tickFormatter={(v) => `${v}ms`}
                />
                <Tooltip
                  content={(props) =>
                    ChartTooltip({
                      active: props.active,
                      payload: props.payload as ReadonlyArray<{
                        name?: string | number
                        value?: number | string
                        color?: string
                      }>,
                      label: props.label,
                    })
                  }
                  cursor={{ fill: 'rgba(30, 41, 59, 0.4)' }}
                />
                <Bar
                  dataKey="postgres"
                  name="Postgres"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                  animationBegin={0}
                />
                <Bar
                  dataKey="redis"
                  name="Redis"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
            {/* Custom HTML legend */}
            <div className="mt-4 flex justify-center gap-6 border-t border-slate-800 pt-4">
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-3 w-3 rounded-sm bg-red-400" />
                Postgres
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-3 w-3 rounded-sm bg-emerald-400" />
                Redis
              </span>
            </div>
          </div>

          {/* Conclusion card — slide-up with delay */}
          <div
            className={`animate-fade-in rounded-lg border border-slate-700 border-l-4 bg-slate-900/50 p-4 font-mono text-sm text-slate-300 ${
              result.speedupFactor > 10
                ? 'border-l-emerald-500'
                : result.speedupFactor >= 3
                  ? 'border-l-amber-500'
                  : 'border-l-red-500'
            }`}
            style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
          >
            <p className="whitespace-pre-wrap">{result.conclusion}</p>
          </div>

          {/* History — last 5 runs */}
          {history.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
                Recent runs
              </h2>
              <div className="flex flex-wrap gap-2">
                {history.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDisplayResult(item.result)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      displayResult?.ranAt === item.ranAt
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="block font-mono text-xs text-slate-500">
                      {formatRelativeTime(new Date(item.ranAt), { addSuffix: true })}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-100">
                      {item.result.speedupFactor.toFixed(1)}x
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Cache status section — always fetch and show when available */}
      {cacheStatusList && cacheStatusList.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            Cache status
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cache name</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead>Key count</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cacheStatusList.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-slate-200">
                      {entry.cacheName ?? entry.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {entry.ttl != null ? `${entry.ttl}s` : '—'}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {entry.keyCount ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === 'Active' ? 'success' : 'secondary'
                        }
                      >
                        {entry.status ?? '—'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  )
}

export default BenchmarkPage
