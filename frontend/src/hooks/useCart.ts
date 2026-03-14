import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { CartItem } from '../types/api.types'
import type { CartTotal } from '../types/api.types'

function cartKey(userId: string) {
  return ['cart', userId] as const
}

export function useCart(userId: string | undefined) {
  return useQuery({
    queryKey: cartKey(userId ?? ''),
    queryFn: async (): Promise<CartItem[]> => {
      const { data } = await api.get<CartItem[] | { items?: CartItem[] }>(
        `/api/cart/${userId}`
      )
      if (Array.isArray(data)) return data
      return (data as { items?: CartItem[] }).items ?? []
    },
    enabled: !!userId,
  })
}

export function useCartTotal(userId: string | undefined) {
  return useQuery({
    queryKey: [...cartKey(userId ?? ''), 'total'],
    queryFn: async (): Promise<number> => {
      const { data } = await api.get<number | CartTotal>(`/api/cart/${userId}/total`)
      return typeof data === 'number' ? data : (data?.total ?? 0)
    },
    enabled: !!userId,
  })
}

export function useCartViewed(userId: string | undefined) {
  return useQuery({
    queryKey: [...cartKey(userId ?? ''), 'viewed'],
    queryFn: async (): Promise<string[]> => {
      const { data } = await api.get<string[] | { productIds?: string[] }>(
        `/api/cart/${userId}/viewed`
      )
      if (Array.isArray(data)) return data
      return (data as { productIds?: string[] }).productIds ?? []
    },
    enabled: !!userId,
  })
}

export function useUpdateCartItem(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string
      quantity: number
    }) => {
      if (quantity <= 0) {
        await api.delete(`/api/cart/${userId}/items/${productId}`)
      } else {
        await api.post(`/api/cart/${userId}/items`, { productId, quantity })
      }
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: cartKey(userId) })
    },
  })
}

export function useRemoveCartItem(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/api/cart/${userId}/items/${productId}`)
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: cartKey(userId) })
    },
  })
}

export function useClearCart(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/api/cart/${userId}`)
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: cartKey(userId) })
    },
  })
}
