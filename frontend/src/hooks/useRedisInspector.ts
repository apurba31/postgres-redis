import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { RedisKeyEntry } from '../types/api.types'
import type { RedisInfo } from '../types/api.types'

/** Keys search — trigger with pattern. Backend may expose GET /api/redis/inspect/keys?pattern= */
export function useRedisKeys(pattern: string | null) {
  return useQuery({
    queryKey: ['redis', 'inspect', 'keys', pattern],
    queryFn: async (): Promise<RedisKeyEntry[]> => {
      try {
        const { data } = await api.get<RedisKeyEntry[]>(
          '/api/redis/inspect/keys',
          { params: { pattern: pattern ?? '*' } }
        )
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    },
    enabled: !!pattern && pattern.length > 0,
    retry: false,
  })
}

/** Server info — auto-refresh every 5s */
export function useRedisInfo() {
  return useQuery({
    queryKey: ['redis', 'inspect', 'info'],
    queryFn: async (): Promise<RedisInfo> => {
      try {
        const { data } = await api.get<RedisInfo>('/api/redis/inspect/info')
        return data ?? {}
      } catch {
        return {}
      }
    },
    refetchInterval: 5000,
    retry: false,
  })
}
