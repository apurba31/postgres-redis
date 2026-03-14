import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { BenchmarkResult } from '../types/api.types'
import type { CacheStatusEntry } from '../types/api.types'

export function useRunBenchmark() {
  return useMutation({
    mutationFn: async (iterations: number): Promise<BenchmarkResult> => {
      const { data } = await api.get<BenchmarkResult>('/api/benchmark/run', {
        params: { iterations },
      })
      return data
    },
  })
}

export function useCacheStatus() {
  return useQuery({
    queryKey: ['benchmark', 'cache-status'],
    queryFn: async (): Promise<CacheStatusEntry[]> => {
      const { data } = await api.get<CacheStatusEntry[] | CacheStatusEntry>('/api/benchmark/cache-status')
      return Array.isArray(data) ? data : data ? [data] : []
    },
  })
}
