import { FastifyInstance } from 'fastify'
import { ContactsService } from './contacts.service'
import { createContactSchema, updateContactSchema, bulkTagSchema } from '@flowzap/shared'
import { z } from 'zod'

export async function contactsRoutes(fastify: FastifyInstance) {
  const service = new ContactsService(fastify)

  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/contacts', async (request, reply) => {
    const query = z.object({
      search: z.string().optional(),
      tags: z.string().optional(),
      optOut: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    }).parse(request.query)

    try {
      const result = await service.getContacts(request.user.sub, {
        search: query.search,
        tags: query.tags ? query.tags.split(',') : undefined,
        optOut: query.optOut !== undefined ? query.optOut === 'true' : undefined,
        page: query.page,
        limit: query.limit,
      })
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/contacts/export', async (request, reply) => {
    try {
      const csv = await service.exportContacts(request.user.sub)
      reply.header('Content-Type', 'text/csv')
      reply.header('Content-Disposition', 'attachment; filename="contacts.csv"')
      return reply.send(csv)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/contacts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const contact = await service.getContact(request.user.sub, id)
      return reply.send(contact)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/contacts', async (request, reply) => {
    const input = createContactSchema.parse(request.body)
    try {
      const contact = await service.createContact(request.user.sub, input)
      return reply.status(201).send(contact)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.put('/contacts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const input = updateContactSchema.parse(request.body)
    try {
      const contact = await service.updateContact(request.user.sub, id, input)
      return reply.send(contact)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.delete('/contacts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const result = await service.deleteContact(request.user.sub, id)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.patch('/contacts/:id/opt-out', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { optOut } = z.object({ optOut: z.boolean() }).parse(request.body)
    try {
      const contact = await service.optOutContact(request.user.sub, id, optOut)
      return reply.send(contact)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/contacts/bulk-tag', async (request, reply) => {
    const input = bulkTagSchema.parse(request.body)
    try {
      const result = await service.bulkTagContacts(
        request.user.sub,
        input.contactIds,
        input.tags,
        input.action
      )
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/contacts/import', async (request, reply) => {
    const { csv } = z.object({ csv: z.string().min(1) }).parse(request.body)
    try {
      const result = await service.importContacts(request.user.sub, csv)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })
}
