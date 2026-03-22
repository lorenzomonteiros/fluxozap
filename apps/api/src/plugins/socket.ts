import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'

declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer
  }
}

async function socketPlugin(fastify: FastifyInstance) {
  const httpServer = createServer(fastify.server)

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    fastify.log.info(`Socket connected: ${socket.id}`)

    socket.on('join:instance', (instanceId: string) => {
      socket.join(`instance:${instanceId}`)
    })

    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`)
    })

    socket.on('disconnect', () => {
      fastify.log.info(`Socket disconnected: ${socket.id}`)
    })
  })

  fastify.decorate('io', io)

  fastify.addHook('onClose', () => {
    io.close()
  })
}

export default fp(socketPlugin, { name: 'socket' })
