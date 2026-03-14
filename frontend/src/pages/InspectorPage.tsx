import { useState } from 'react'
import { Search, AlertTriangle, X, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { useRedisKeys, useRedisInfo } from '../hooks/useRedisInspector'
import type { RedisKeyEntry } from '../types/api.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
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
import { Skeleton } from '../components/ui/skeleton'

const TYPE_BADGE: Record<string, string> = {
  string: 'bg-blue-900/50 text-blue-300 border-blue-700',
  hash: 'bg-purple-900/50 text-purple-300 border-purple-700',
  zset: 'bg-amber-900/50 text-amber-300 border-amber-700',
  list: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  set: 'bg-slate-700 text-slate-300 border-slate-600',
}

function formatTtl(seconds: number | undefined): string {
  if (seconds == null || seconds < 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function InspectorPage() {
  const [pattern, setPattern] = useState('')
  const [searchPattern, setSearchPattern] = useState<string | null>(null)
  const [viewEntry, setViewEntry] = useState<RedisKeyEntry | null>(null)
  const [deleteKey, setDeleteKey] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { data: keys = [], isLoading: keysLoading } = useRedisKeys(searchPattern)
  const { data: info = {}, isLoading: infoLoading } = useRedisInfo()

  const handleSearch = () => {
    setSearchPattern(pattern.trim() || '*')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteKey) return
    try {
      await api.delete(`/api/redis/inspect/keys/${encodeURIComponent(deleteKey)}`)
      toast.success('Key deleted')
      setDeleteKey(null)
      queryClient.invalidateQueries({ queryKey: ['redis', 'inspect', 'keys'] })
    } catch {
      toast.error('Failed to delete key')
    }
  }

  return (
    <div className="space-y-6 font-mono">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold text-slate-100">
          Redis Inspector
        </h1>
        <Badge variant="warning" className="font-sans">
          dev only
        </Badge>
      </header>

      <div
        className="flex items-center gap-2 rounded-lg border border-amber-700/50 bg-amber-900/20 px-4 py-3 text-amber-200"
        role="alert"
      >
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-sm">
          This page is for development only. Disable in production.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. products:* or cart:*"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-md"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>

      {/* Info panel */}
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Server info
        </h2>
        {infoLoading ? (
          <div className="flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <span>
              Memory used: {info.memoryUsed ?? '—'}
            </span>
            <span>
              Connected clients: {info.connectedClients ?? '—'}
            </span>
            <span>
              Total keys: {info.totalKeys ?? '—'}
            </span>
          </div>
        )}
      </section>

      {/* Results table */}
      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Keys
        </h2>
        {!searchPattern ? (
          <p className="rounded-lg border border-slate-700 bg-slate-900/30 p-4 text-sm text-slate-500">
            Enter a pattern and click Search to list keys.
          </p>
        ) : keysLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/30 py-12">
            <p className="text-sm text-slate-500">No keys found for this pattern.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead>Value preview</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((entry) => {
                  const ttl = entry.ttl ?? -1
                  const ttlStr = formatTtl(entry.ttl)
                  return (
                    <TableRow key={entry.key}>
                      <TableCell className="font-mono text-slate-200 break-all">
                        {entry.key}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[entry.type] ?? 'bg-slate-700 text-slate-300'}`}
                        >
                          {entry.type}
                        </span>
                      </TableCell>
                      <TableCell
                        className={ttl >= 0 && ttl < 60 ? 'text-red-400' : 'text-slate-400'}
                      >
                        {ttlStr}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs text-slate-500">
                        {entry.valuePreview != null
                          ? String(entry.valuePreview).slice(0, 60)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewEntry(entry)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            aria-label="View full value"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteKey(entry.key)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-900/40 hover:text-red-400"
                            aria-label="Delete key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Key detail dialog */}
      {viewEntry && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/80"
            aria-hidden
            onClick={() => setViewEntry(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-mono text-sm font-medium text-slate-200">
                {viewEntry.key}
              </h3>
              <button
                type="button"
                onClick={() => setViewEntry(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-400">
              <p>
                Type: <span className="text-slate-200">{viewEntry.type}</span>
              </p>
              <p>
                TTL: {formatTtl(viewEntry.ttl)} (
                {viewEntry.ttl != null ? `${viewEntry.ttl} seconds` : 'no expiry'})
              </p>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Full value
              </p>
              <pre className="max-h-96 overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-4 text-xs text-slate-300">
                {viewEntry.value != null
                  ? JSON.stringify(viewEntry.value, null, 2)
                  : viewEntry.valuePreview ?? '—'}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteKey} onOpenChange={(o) => !o && setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the key from Redis. This cannot be
              undone.
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

export default InspectorPage
