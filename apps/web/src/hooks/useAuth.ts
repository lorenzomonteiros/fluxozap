import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/auth.service'
import { setTokens } from '../services/api'
import { useToast } from './useToast'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        const result = await authService.login({ email, password })
        setTokens(result.accessToken, result.refreshToken)
        setUser(result.user)
        navigate('/dashboard')
        toast({ message: `Welcome back, ${result.user.name}!`, variant: 'success' })
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } }
        const message = error.response?.data?.error ?? 'Login failed'
        toast({ message, variant: 'error' })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [navigate, setLoading, setUser, toast]
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true)
      try {
        const result = await authService.register({ name, email, password })
        setTokens(result.accessToken, result.refreshToken)
        setUser(result.user)
        navigate('/dashboard')
        toast({ message: 'Account created successfully!', variant: 'success' })
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } }
        const message = error.response?.data?.error ?? 'Registration failed'
        toast({ message, variant: 'error' })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [navigate, setLoading, setUser, toast]
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      storeLogout()
      navigate('/login')
    }
  }, [navigate, storeLogout])

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getMe()
      setUser(user)
    } catch {
      storeLogout()
      navigate('/login')
    }
  }, [navigate, setUser, storeLogout])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }
}
