import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  referralCode: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  phone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  updateUser: (user: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  referredBy?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { token, user } = response.data
          set({ token, user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', data)
          const { token, user } = response.data
          set({ token, user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await api.get('/auth/me')
          set({ user: response.data.user })
        } catch {
          set({ token: null, user: null, isAuthenticated: false })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
