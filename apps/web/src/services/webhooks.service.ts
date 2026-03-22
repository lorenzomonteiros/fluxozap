import api from './api'
import { Webhook, WebhookLog, WebhookEvent } from '../types'

export const webhooksService = {
  async getWebhooks(): Promise<Webhook[]> {
    const response = await api.get('/webhooks')
    return response.data
  },

  async getWebhook(id: string): Promise<Webhook> {
    const response = await api.get(`/webhooks/${id}`)
    return response.data
  },

  async createWebhook(data: {
    name: string
    url: string
    secret?: string
    events: string[]
  }): Promise<Webhook> {
    const response = await api.post('/webhooks', data)
    return response.data
  },

  async updateWebhook(
    id: string,
    data: Partial<Webhook> & { secret?: string }
  ): Promise<Webhook> {
    const response = await api.put(`/webhooks/${id}`, data)
    return response.data
  },

  async deleteWebhook(id: string): Promise<void> {
    await api.delete(`/webhooks/${id}`)
  },

  async getWebhookLogs(id: string): Promise<WebhookLog[]> {
    const response = await api.get(`/webhooks/${id}/logs`)
    return response.data
  },

  async getAvailableEvents(): Promise<WebhookEvent[]> {
    const response = await api.get('/webhooks/events')
    return response.data
  },
}
