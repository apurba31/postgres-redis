import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — mirrors Redis TTL strategy
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401) return false
        return true
      },
    },
  },
})
