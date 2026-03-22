import api from './api'
import { Flow, FlowExecution, DashboardStats } from '../types'

export const flowsService = {
  async getFlows(): Promise<Flow[]> {
    const response = await api.get('/flows')
    return response.data
  },

  async getFlow(id: string): Promise<Flow> {
    const response = await api.get(`/flows/${id}`)
    return response.data
  },

  async createFlow(data: {
    name: string
    description?: string
    trigger: { type: string; value?: string; instanceId?: string }
    nodes?: unknown[]
    edges?: unknown[]
  }): Promise<Flow> {
    const response = await api.post('/flows', data)
    return response.data
  },

  async updateFlow(id: string, data: Partial<Flow>): Promise<Flow> {
    const response = await api.put(`/flows/${id}`, data)
    return response.data
  },

  async deleteFlow(id: string): Promise<void> {
    await api.delete(`/flows/${id}`)
  },

  async toggleFlow(id: string, isActive: boolean): Promise<Flow> {
    const response = await api.patch(`/flows/${id}/toggle`, { isActive })
    return response.data
  },

  async getExecutions(flowId: string): Promise<FlowExecution[]> {
    const response = await api.get(`/flows/${flowId}/executions`)
    return response.data
  },

  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/flows/stats')
    return response.data
  },
}
