import api, { setTokens, clearTokens } from './api'
import { AuthResponse, User } from '../types'

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    setTokens(response.data.accessToken, response.data.refreshToken)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      clearTokens()
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(data: { name?: string; avatarUrl?: string | null }): Promise<User> {
    const response = await api.put('/auth/profile', data)
    return response.data
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put('/auth/change-password', data)
  },
}
