import { create } from 'zustand'
import { WhatsAppInstance, InstanceStatus } from '../types'

interface InstanceStore {
  instances: WhatsAppInstance[]
  loading: boolean
  setInstances: (instances: WhatsAppInstance[]) => void
  addInstance: (instance: WhatsAppInstance) => void
  removeInstance: (id: string) => void
  updateInstanceStatus: (id: string, status: InstanceStatus) => void
  setLoading: (loading: boolean) => void
}

export const useInstanceStore = create<InstanceStore>((set) => ({
  instances: [],
  loading: false,

  setInstances: (instances) => set({ instances }),

  addInstance: (instance) =>
    set((state) => ({ instances: [instance, ...state.instances] })),

  removeInstance: (id) =>
    set((state) => ({ instances: state.instances.filter((i) => i.id !== id) })),

  updateInstanceStatus: (id, status) =>
    set((state) => ({
      instances: state.instances.map((i) =>
        i.id === id ? { ...i, status } : i
      ),
    })),

  setLoading: (loading) => set({ loading }),
}))
