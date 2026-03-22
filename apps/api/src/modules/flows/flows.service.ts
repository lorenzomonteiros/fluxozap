import { FastifyInstance } from 'fastify'
import { PrismaClient, Prisma } from '@prisma/client'
import { CreateFlowInput, UpdateFlowInput } from '@flowzap/shared'

export class FlowsService {
  private prisma: PrismaClient

  constructor(fastify: FastifyInstance) {
    this.prisma = fastify.prisma
  }

  async getFlows(userId: string) {
    const flows = await this.prisma.flow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { executions: true } },
      },
    })

    return flows.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      isActive: f.isActive,
      trigger: f.trigger,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      executionCount: f._count.executions,
    }))
  }

  async getFlow(userId: string, flowId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id: flowId, userId },
    })

    if (!flow) {
      throw { statusCode: 404, message: 'Flow not found' }
    }

    return flow
  }

  async createFlow(userId: string, input: CreateFlowInput) {
    const flow = await this.prisma.flow.create({
      data: {
        userId,
        name: input.name,
        description: input.description ?? null,
        trigger: input.trigger as Prisma.InputJsonValue,
        nodes: (input.nodes ?? []) as Prisma.InputJsonValue,
        edges: (input.edges ?? []) as Prisma.InputJsonValue,
        isActive: false,
      },
    })
    return flow
  }

  async updateFlow(userId: string, flowId: string, input: UpdateFlowInput) {
    const existing = await this.prisma.flow.findFirst({ where: { id: flowId, userId } })
    if (!existing) throw { statusCode: 404, message: 'Flow not found' }

    const updated = await this.prisma.flow.update({
      where: { id: flowId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.trigger !== undefined && { trigger: input.trigger as Prisma.InputJsonValue }),
        ...(input.nodes !== undefined && { nodes: input.nodes as Prisma.InputJsonValue }),
        ...(input.edges !== undefined && { edges: input.edges as Prisma.InputJsonValue }),
      },
    })
    return updated
  }

  async deleteFlow(userId: string, flowId: string) {
    const existing = await this.prisma.flow.findFirst({ where: { id: flowId, userId } })
    if (!existing) throw { statusCode: 404, message: 'Flow not found' }

    await this.prisma.flow.delete({ where: { id: flowId } })
    return { message: 'Flow deleted successfully' }
  }

  async toggleFlow(userId: string, flowId: string, isActive: boolean) {
    const existing = await this.prisma.flow.findFirst({ where: { id: flowId, userId } })
    if (!existing) throw { statusCode: 404, message: 'Flow not found' }

    const updated = await this.prisma.flow.update({
      where: { id: flowId },
      data: { isActive },
    })
    return updated
  }

  async getExecutions(userId: string, flowId: string) {
    const flow = await this.prisma.flow.findFirst({ where: { id: flowId, userId } })
    if (!flow) throw { statusCode: 404, message: 'Flow not found' }

    const executions = await this.prisma.flowExecution.findMany({
      where: { flowId },
      orderBy: { startedAt: 'desc' },
      take: 100,
      include: {
        contact: { select: { id: true, phone: true, name: true } },
      },
    })

    return executions
  }

  async getStats(userId: string) {
    const [totalFlows, activeFlows, totalExecutions] = await Promise.all([
      this.prisma.flow.count({ where: { userId } }),
      this.prisma.flow.count({ where: { userId, isActive: true } }),
      this.prisma.flowExecution.count({
        where: { flow: { userId } },
      }),
    ])

    const recentExecutions = await this.prisma.flowExecution.findMany({
      where: { flow: { userId } },
      orderBy: { startedAt: 'desc' },
      take: 7,
      select: { startedAt: true, status: true },
    })

    return { totalFlows, activeFlows, totalExecutions, recentExecutions }
  }
}
