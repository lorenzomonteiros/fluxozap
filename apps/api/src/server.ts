import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyPlugin from 'fastify-plugin'

import dbPlugin from './plugins/db'
import authPlugin from './plugins/auth'
import socketPlugin from './plugins/socket'

import { authRoutes } from './modules/auth/auth.routes'
import { whatsappRoutes } from './modules/whatsapp/whatsapp.routes'
import { flowsRoutes } from './modules/flows/flows.routes'
import { contactsRoutes } from './modules/contacts/contacts.routes'
import { messagesRoutes } from './modules/messages/messages.routes'
import { webhooksRoutes } from './modules/webhooks/webhooks.routes'

import { BaileysManager } from './modules/whatsapp/baileys.manager'
import { createFlowQueue, startFlowWorker } from './queues/flow.worker'

const PORT = parseInt(process.env.PORT ?? '3000', 10)
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
    trustProxy: true,
  })

  await fastify.register(fastifyCors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  await fastify.register(fastifyCookie)
  await fastify.register(fastifyMultipart, { limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50') * 1024 * 1024 } })
  await fastify.register(fastifyRateLimit, { max: 200, timeWindow: '1 minute' })

  await fastify.register(dbPlugin)
  await fastify.register(authPlugin)
  await fastify.register(socketPlugin)

  const flowQueue = createFlowQueue(REDIS_URL)

  const baileysManager = new BaileysManager(fastify.io, fastify.prisma, flowQueue)

  const worker = startFlowWorker(REDIS_URL, fastify.prisma, baileysManager)

  fastify.addHook('onClose', async () => {
    await worker.close()
    await flowQueue.close()
  })

  await fastify.register(
    fastifyPlugin(async (app) => {
      await app.register(async (instance) => {
        await authRoutes(instance)
      }, { prefix: '/api/auth' })

      await app.register(async (instance) => {
        await whatsappRoutes(instance, { manager: baileysManager })
      }, { prefix: '/api' })

      await app.register(async (instance) => {
        await flowsRoutes(instance)
      }, { prefix: '/api' })

      await app.register(async (instance) => {
        await contactsRoutes(instance)
      }, { prefix: '/api' })

      await app.register(async (instance) => {
        await messagesRoutes(instance, { manager: baileysManager })
      }, { prefix: '/api' })

      await app.register(async (instance) => {
        await webhooksRoutes(instance)
      }, { prefix: '/api' })
    })
  )

  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error)

    if (error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: JSON.parse(error.message),
      })
    }

    return reply.status(error.statusCode ?? 500).send({
      error: error.message ?? 'Internal server error',
    })
  })

  return fastify
}

async function start() {
  const server = await buildServer()

  try {
    await server.listen({ port: PORT, host: '0.0.0.0' })
    server.log.info(`FlowZap API running on port ${PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
