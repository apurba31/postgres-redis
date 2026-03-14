import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { Product } from '../types/api.types'
import type { PageResponse } from '../types/api.types'

const PRODUCTS_LIST_STALE_MS = 1000 * 60 * 10 // 10 min — matches backend PRODUCTS cache TTL
const PRODUCT_SINGLE_STALE_MS = 1000 * 60 * 60 // 1 hour — matches backend TTL

function productsListQueryKey(category: string | undefined, page: number) {
  return ['products', 'list', category ?? 'all', page] as const
}

export function useProductIds() {
  return useQuery({
    queryKey: ['products', 'ids'],
    queryFn: async (): Promise<string[]> => {
      const { data } = await api.get<string[]>('/api/products/ids')
      return Array.isArray(data) ? data : []
    },
  })
}

export function useProducts(category?: string, page = 0) {
  return useQuery({
    queryKey: productsListQueryKey(category, page),
    queryFn: async (): Promise<PageResponse<Product>> => {
      const cat = category && category !== 'all' ? category : 'all'
      const { data } = await api.get<PageResponse<Product>>(
        `/api/products/category/${encodeURIComponent(cat)}`,
        { params: { page } }
      )
      return data
    },
    staleTime: PRODUCTS_LIST_STALE_MS,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<Product> => {
      const { data } = await api.get<Product>(`/api/products/${id}`)
      return data
    },
    staleTime: PRODUCT_SINGLE_STALE_MS,
    enabled: !!id,
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
    },
  })
}
