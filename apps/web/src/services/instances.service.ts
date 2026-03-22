import api from './api'
import { WhatsAppInstance } from '../types'

export const instancesService = {
  async getInstances(): Promise<WhatsAppInstance[]> {
    const response = await api.get('/instances')
    return response.data
  },

  async createInstance(name: string): Promise<WhatsAppInstance> {
    const response = await api.post('/instances', { name })
    return response.data
  },

  async deleteInstance(id: string): Promise<void> {
    await api.delete(`/instances/${id}`)
  },

  async connectInstance(id: string): Promise<void> {
    await api.post(`/instances/${id}/connect`)
  },

  async disconnectInstance(id: string): Promise<void> {
    await api.post(`/instances/${id}/disconnect`)
  },

  async getInstanceStatus(id: string): Promise<{
    instanceId: string
    status: string
    qr?: string
    phoneNumber?: string | null
    profileName?: string | null
  }> {
    const response = await api.get(`/instances/${id}/status`)
    return response.data
  },
}
