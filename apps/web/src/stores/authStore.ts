import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { clearTokens } from '../services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        clearTokens()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'flowzap-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
