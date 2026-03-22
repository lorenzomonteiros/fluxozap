import { FastifyInstance } from 'fastify'
import { WebhooksService } from './webhooks.service'
import { z } from 'zod'

export async function webhooksRoutes(fastify: FastifyInstance) {
  const service = new WebhooksService(fastify)

  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/webhooks', async (request, reply) => {
    try {
      const webhooks = await service.getWebhooks(request.user.sub)
      return reply.send(webhooks)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/webhooks/events', async (request, reply) => {
    const events = await service.getAvailableEvents()
    return reply.send(events)
  })

  fastify.get('/webhooks/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const webhook = await service.getWebhook(request.user.sub, id)
      return reply.send(webhook)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/webhooks', async (request, reply) => {
    const body = z.object({
      name: z.string().min(1).max(100),
      url: z.string().url(),
      secret: z.string().optional(),
      events: z.array(z.string()).min(1),
    }).parse(request.body)

    try {
      const webhook = await service.createWebhook(request.user.sub, body)
      return reply.status(201).send(webhook)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.put('/webhooks/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({
      name: z.string().min(1).max(100).optional(),
      url: z.string().url().optional(),
      secret: z.string().optional(),
      events: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }).parse(request.body)

    try {
      const webhook = await service.updateWebhook(request.user.sub, id, body)
      return reply.send(webhook)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.delete('/webhooks/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const result = await service.deleteWebhook(request.user.sub, id)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/webhooks/:id/logs', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const logs = await service.getWebhookLogs(request.user.sub, id)
      return reply.send(logs)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })
}
