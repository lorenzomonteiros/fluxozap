import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { useInstanceStore } from '../stores/instanceStore'
import { InstanceStatus } from '../types'

let socketInstance: Socket | null = null

export function useSocket() {
  const { user, isAuthenticated } = useAuthStore()
  const { updateInstanceStatus } = useInstanceStore()
  const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map())

  useEffect(() => {
    if (!isAuthenticated || !user) return

    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io('/', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })
    }

    socketInstance.on('connect', () => {
      if (user) {
        socketInstance?.emit('join:user', user.id)
      }
    })

    socketInstance.on('instance:status', (data: { instanceId: string; status: InstanceStatus }) => {
      updateInstanceStatus(data.instanceId, data.status)
      const listeners = listenersRef.current.get('instance:status')
      listeners?.forEach((cb) => cb(data))
    })

    socketInstance.on('message:new', (data: unknown) => {
      const listeners = listenersRef.current.get('message:new')
      listeners?.forEach((cb) => cb(data))
    })

    return () => {
      socketInstance?.off('instance:status')
      socketInstance?.off('message:new')
    }
  }, [isAuthenticated, user, updateInstanceStatus])

  const joinInstance = useCallback((instanceId: string) => {
    socketInstance?.emit('join:instance', instanceId)
  }, [])

  const on = useCallback((event: string, callback: (data: unknown) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set())
    }
    listenersRef.current.get(event)!.add(callback)

    return () => {
      listenersRef.current.get(event)?.delete(callback)
    }
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    socketInstance?.emit(event, data)
  }, [])

  return { joinInstance, on, emit, socket: socketInstance }
}
