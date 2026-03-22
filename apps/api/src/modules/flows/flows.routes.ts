import { FastifyInstance } from 'fastify'
import { FlowsService } from './flows.service'
import { createFlowSchema, updateFlowSchema, toggleFlowSchema } from '@flowzap/shared'

export async function flowsRoutes(fastify: FastifyInstance) {
  const service = new FlowsService(fastify)

  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/flows', async (request, reply) => {
    try {
      const flows = await service.getFlows(request.user.sub)
      return reply.send(flows)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/flows/stats', async (request, reply) => {
    try {
      const stats = await service.getStats(request.user.sub)
      return reply.send(stats)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/flows/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const flow = await service.getFlow(request.user.sub, id)
      return reply.send(flow)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.post('/flows', async (request, reply) => {
    const input = createFlowSchema.parse(request.body)
    try {
      const flow = await service.createFlow(request.user.sub, input)
      return reply.status(201).send(flow)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.put('/flows/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const input = updateFlowSchema.parse(request.body)
    try {
      const flow = await service.updateFlow(request.user.sub, id, input)
      return reply.send(flow)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.delete('/flows/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const result = await service.deleteFlow(request.user.sub, id)
      return reply.send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.patch('/flows/:id/toggle', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { isActive } = toggleFlowSchema.parse(request.body)
    try {
      const flow = await service.toggleFlow(request.user.sub, id, isActive)
      return reply.send(flow)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })

  fastify.get('/flows/:id/executions', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const executions = await service.getExecutions(request.user.sub, id)
      return reply.send(executions)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      return reply.status(e.statusCode ?? 500).send({ error: e.message })
    }
  })
}
