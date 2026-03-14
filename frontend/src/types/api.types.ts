/**
 * API types matching backend DTOs (backend-contract.mdc).
 * Plus ApiError and PageResponse for client use.
 */

/** Matches Product.java */
export interface Product {
  id: string
  name: string
  price: number
  category: string
  tags: string[]
  attributes: Record<string, unknown>
  inventory: {
    stockCount: number
    warehouseLocation: string
    reserved: boolean
  }
  reviews: Array<{
    reviewerId: string
    rating: number
    comment: string
    reviewDate: string
  }>
  lastUpdated: string
}

/** Matches CartItem.java */
export interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  options: Record<string, unknown>
}

/** Matches BenchmarkResult.java */
export interface BenchmarkResult {
  iterations: number
  testedProductId: string
  avgDbMs: number
  avgRedisMs: number
  p50DbMs: number
  p50RedisMs: number
  p99DbMs: number
  p99RedisMs: number
  speedupFactor: number
  speedupLabel: string
  totalDbTimeMs: number
  totalRedisTimeMs: number
  conclusion: string
  ranAt: string
}

/** Cache status entry from GET /api/benchmark/cache-status */
export interface CacheStatusEntry {
  name?: string
  cacheName?: string
  ttl?: number
  keyCount?: number
  status?: 'Active' | 'Empty' | string
}

/** Auth */
export interface User {
  id: string
  email: string
  name: string
  roles: string[]
  provider: 'local' | 'google' | 'github'
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  message: string
}

/** Client-side API error shape */
export interface ApiError {
  message: string
  status: number
  timestamp: string
}

/** Spring-style paged response */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
}

/** Cart total from GET /api/cart/{userId}/total */
export interface CartTotal {
  total?: number
}

/** Redis Inspector — key entry from GET /api/redis/inspect/keys */
export interface RedisKeyEntry {
  key: string
  type: 'string' | 'hash' | 'list' | 'zset' | 'set'
  ttl?: number
  valuePreview?: string
  value?: unknown
}

/** Redis Inspector — server info from GET /api/redis/inspect/info */
export interface RedisInfo {
  memoryUsed?: string
  connectedClients?: number
  totalKeys?: number
  [key: string]: unknown
}
