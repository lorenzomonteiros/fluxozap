import { FastifyInstance } from 'fastify'
import { WhatsAppService } from './whatsapp.service'
import { BaileysManager } from './baileys.manager'
import { z } from 'zod'

export async function whatsappRoutes(
  fastify: FastifyInstance,
  options: { manager: BaileysManager }
) {
  const service = new WhatsAppService(fastify, options.manager)

  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/instances', async (request, reply) => {
    try {
      const instances = await service.getInstances(request.user.sub)
      return reply.send(instances)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/instances', async (request, reply) => {
    const { name } = z.object({ name: z.string().min(1).max(100) }).parse(request.body)
    try {
      const instance = await service.createInstance(request.user.sub, name)
      return reply.status(201).send(instance)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.delete('/instances/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const result = await service.deleteInstance(request.user.sub, id)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/instances/:id/connect', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const result = await service.connectInstance(request.user.sub, id)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/instances/:id/disconnect', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const result = await service.disconnectInstance(request.user.sub, id)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/instances/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const status = await service.getInstanceStatus(request.user.sub, id)
      return reply.send(status)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })
}
