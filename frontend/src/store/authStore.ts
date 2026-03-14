import { create } from 'zustand'
import type { User } from '../types/api.types'
import { api } from '../lib/axios'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  authLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  clearAuth: () => void
  setAuthLoading: (loading: boolean) => void
  restoreSession: () => Promise<void>
}

export const authStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  authLoading: true,

  login: (user: User) => {
    set({ user, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      get().clearAuth()
    }
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false })
  },

  setAuthLoading: (authLoading: boolean) => {
    set({ authLoading })
  },

  restoreSession: async () => {
    set({ authLoading: true })
    try {
      const { data } = await api.get<User>('/api/auth/me')
      set({ user: data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ authLoading: false })
    }
  },
}))
