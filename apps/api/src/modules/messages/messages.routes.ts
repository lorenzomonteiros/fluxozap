import { FastifyInstance } from 'fastify'
import { MessagesService } from './messages.service'
import { BaileysManager } from '../whatsapp/baileys.manager'
import { z } from 'zod'

export async function messagesRoutes(
  fastify: FastifyInstance,
  options: { manager: BaileysManager }
) {
  const service = new MessagesService(fastify, options.manager)

  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/messages', async (request, reply) => {
    const query = z.object({
      instanceId: z.string().optional(),
      contactId: z.string().optional(),
      direction: z.enum(['inbound', 'outbound']).optional(),
      type: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50),
    }).parse(request.query)

    try {
      const result = await service.getMessages(request.user.sub, query)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/messages/conversations', async (request, reply) => {
    try {
      const conversations = await service.getConversations(request.user.sub)
      return reply.send(conversations)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/messages/send', async (request, reply) => {
    const body = z.object({
      instanceId: z.string(),
      to: z.string(),
      message: z.string().min(1),
    }).parse(request.body)

    try {
      const result = await service.sendMessage(
        request.user.sub,
        body.instanceId,
        body.to,
        body.message
      )
      return reply.status(201).send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })
}
