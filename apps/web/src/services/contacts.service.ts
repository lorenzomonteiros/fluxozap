import api from './api'
import { Contact, ContactsResponse } from '../types'

export const contactsService = {
  async getContacts(params?: {
    search?: string
    tags?: string
    optOut?: boolean
    page?: number
    limit?: number
  }): Promise<ContactsResponse> {
    const response = await api.get('/contacts', { params })
    return response.data
  },

  async getContact(id: string): Promise<Contact> {
    const response = await api.get(`/contacts/${id}`)
    return response.data
  },

  async createContact(data: {
    phone: string
    name?: string
    email?: string
    tags?: string[]
    variables?: Record<string, unknown>
  }): Promise<Contact> {
    const response = await api.post('/contacts', data)
    return response.data
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const response = await api.put(`/contacts/${id}`, data)
    return response.data
  },

  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`)
  },

  async optOutContact(id: string, optOut: boolean): Promise<Contact> {
    const response = await api.patch(`/contacts/${id}/opt-out`, { optOut })
    return response.data
  },

  async bulkTag(contactIds: string[], tags: string[], action: 'add' | 'remove'): Promise<void> {
    await api.post('/contacts/bulk-tag', { contactIds, tags, action })
  },

  async importContacts(csv: string): Promise<{ created: number; skipped: number; message: string }> {
    const response = await api.post('/contacts/import', { csv })
    return response.data
  },

  async exportContacts(): Promise<string> {
    const response = await api.get('/contacts/export', { responseType: 'text' })
    return response.data
  },
}
