import { PrismaClient } from '@prisma/client'
import { BaileysManager } from '../whatsapp/baileys.manager'
import axios from 'axios'

interface FlowContext {
  contactId: string
  instanceId: string
  variables: Record<string, string>
  triggerData: {
    text?: string
    phone?: string
    messageTimestamp?: number | null | undefined
  }
}

interface FlowNode {
  id: string
  type: string
  data: Record<string, unknown>
  position: { x: number; y: number }
}

interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  label?: string
}

export class FlowEngine {
  private prisma: PrismaClient
  private manager: BaileysManager

  constructor(prisma: PrismaClient, manager: BaileysManager) {
    this.prisma = prisma
    this.manager = manager
  }

  async execute(
    flowId: string,
    contactId: string,
    instanceId: string,
    triggerData: FlowContext['triggerData']
  ): Promise<void> {
    const flow = await this.prisma.flow.findUnique({ where: { id: flowId } })
    if (!flow || !flow.isActive) return

    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } })
    if (!contact || contact.optOut) return

    const execution = await this.prisma.flowExecution.create({
      data: { flowId, contactId, status: 'running' },
    })

    const context: FlowContext = {
      contactId,
      instanceId,
      variables: {
        ...(contact.variables as Record<string, string> ?? {}),
        contact_name: contact.name ?? '',
        contact_phone: contact.phone,
        trigger_text: triggerData.text ?? '',
      },
      triggerData,
    }

    const nodes = flow.nodes as FlowNode[]
    const edges = flow.edges as FlowEdge[]

    try {
      const triggerNode = nodes.find((n) => n.type === 'trigger')
      if (!triggerNode) {
        await this.completeExecution(execution.id, 'failed')
        return
      }

      await this.executeFromNode(triggerNode.id, nodes, edges, context, execution.id)

      await this.completeExecution(execution.id, 'completed')
    } catch (error) {
      console.error(`Flow execution error [${execution.id}]:`, error)
      await this.completeExecution(execution.id, 'failed')
    }
  }

  private async executeFromNode(
    nodeId: string,
    nodes: FlowNode[],
    edges: FlowEdge[],
    context: FlowContext,
    executionId: string,
    maxSteps = 100
  ): Promise<void> {
    let currentNodeId: string | null = nodeId
    let steps = 0

    while (currentNodeId && steps < maxSteps) {
      steps++
      const node = nodes.find((n) => n.id === currentNodeId)
      if (!node) break

      await this.prisma.flowExecution.update({
        where: { id: executionId },
        data: { currentNode: currentNodeId },
      })

      const nextNodeId = await this.executeNode(node, edges, context, nodes, executionId)
      currentNodeId = nextNodeId
    }
  }

  private async executeNode(
    node: FlowNode,
    edges: FlowEdge[],
    context: FlowContext,
    allNodes: FlowNode[],
    executionId: string
  ): Promise<string | null> {
    const { type, data } = node

    switch (type) {
      case 'trigger': {
        return this.getNextNode(node.id, edges)
      }

      case 'text_message': {
        const message = this.interpolate(data.message as string, context.variables)
        await this.manager.sendTextMessage(context.instanceId, context.triggerData.phone!, message)
        await this.saveOutboundMessage(context, 'text', { text: message })
        return this.getNextNode(node.id, edges)
      }

      case 'image': {
        await this.manager.sendMediaMessage(
          context.instanceId,
          context.triggerData.phone!,
          'image',
          data.url as string,
          { caption: data.caption as string | undefined }
        )
        await this.saveOutboundMessage(context, 'image', { url: data.url, caption: data.caption })
        return this.getNextNode(node.id, edges)
      }

      case 'audio': {
        await this.manager.sendMediaMessage(
          context.instanceId,
          context.triggerData.phone!,
          'audio',
          data.url as string
        )
        await this.saveOutboundMessage(context, 'audio', { url: data.url })
        return this.getNextNode(node.id, edges)
      }

      case 'video': {
        await this.manager.sendMediaMessage(
          context.instanceId,
          context.triggerData.phone!,
          'video',
          data.url as string,
          { caption: data.caption as string | undefined }
        )
        await this.saveOutboundMessage(context, 'video', { url: data.url, caption: data.caption })
        return this.getNextNode(node.id, edges)
      }

      case 'document': {
        await this.manager.sendMediaMessage(
          context.instanceId,
          context.triggerData.phone!,
          'document',
          data.url as string,
          { caption: data.caption as string | undefined, filename: data.filename as string | undefined }
        )
        await this.saveOutboundMessage(context, 'document', { url: data.url, filename: data.filename })
        return this.getNextNode(node.id, edges)
      }

      case 'delay': {
        const duration = data.duration as number
        const unit = data.unit as 'seconds' | 'minutes' | 'hours'
        const ms = {
          seconds: duration * 1000,
          minutes: duration * 60 * 1000,
          hours: duration * 3600 * 1000,
        }[unit]
        await new Promise((resolve) => setTimeout(resolve, ms))
        return this.getNextNode(node.id, edges)
      }

      case 'condition': {
        const variable = data.variable as string
        const operator = data.operator as string
        const value = data.value as string | undefined
        const varValue = context.variables[variable] ?? ''

        const result = this.evaluateCondition(varValue, operator, value)
        const handle = result ? 'true' : 'false'
        return this.getNextNodeByHandle(node.id, handle, edges)
      }

      case 'tag_action': {
        const action = data.action as 'add' | 'remove'
        const tag = data.tag as string
        const contact = await this.prisma.contact.findUnique({ where: { id: context.contactId } })
        if (contact) {
          const tags = contact.tags as string[]
          const newTags = action === 'add'
            ? Array.from(new Set([...tags, tag]))
            : tags.filter((t) => t !== tag)
          await this.prisma.contact.update({
            where: { id: context.contactId },
            data: { tags: newTags },
          })
        }
        return this.getNextNode(node.id, edges)
      }

      case 'save_variable': {
        const variableName = data.variableName as string
        const source = data.source as 'last_message' | 'static' | 'expression'
        let varValue = ''
        if (source === 'static') {
          varValue = data.value as string ?? ''
        } else if (source === 'last_message') {
          varValue = context.triggerData.text ?? ''
        } else if (source === 'expression') {
          varValue = this.interpolate(data.value as string ?? '', context.variables)
        }
        context.variables[variableName] = varValue

        await this.prisma.contact.update({
          where: { id: context.contactId },
          data: {
            variables: {
              ...(await this.prisma.contact.findUnique({ where: { id: context.contactId } }))?.variables as object ?? {},
              [variableName]: varValue,
            },
          },
        })
        return this.getNextNode(node.id, edges)
      }

      case 'webhook': {
        try {
          const url = this.interpolate(data.url as string, context.variables)
          const method = (data.method as string ?? 'POST').toLowerCase()
          const headers = data.headers as Record<string, string> ?? {}
          const bodyTemplate = data.body as string ?? ''
          const body = bodyTemplate ? JSON.parse(this.interpolate(bodyTemplate, context.variables)) : undefined

          const response = await axios({ method, url, headers, data: body })

          if (data.saveResponseAs) {
            context.variables[data.saveResponseAs as string] = JSON.stringify(response.data)
          }
        } catch (err) {
          console.error('Webhook node error:', err)
        }
        return this.getNextNode(node.id, edges)
      }

      case 'end': {
        return null
      }

      default: {
        return this.getNextNode(node.id, edges)
      }
    }
  }

  private getNextNode(sourceId: string, edges: FlowEdge[]): string | null {
    const edge = edges.find((e) => e.source === sourceId && (!e.sourceHandle || e.sourceHandle === 'default'))
    return edge?.target ?? null
  }

  private getNextNodeByHandle(sourceId: string, handle: string, edges: FlowEdge[]): string | null {
    const edge = edges.find((e) => e.source === sourceId && e.sourceHandle === handle)
    if (edge) return edge.target
    return this.getNextNode(sourceId, edges)
  }

  private evaluateCondition(
    value: string,
    operator: string,
    compareValue?: string
  ): boolean {
    const cv = compareValue ?? ''
    switch (operator) {
      case 'equals': return value === cv
      case 'not_equals': return value !== cv
      case 'contains': return value.includes(cv)
      case 'not_contains': return !value.includes(cv)
      case 'starts_with': return value.startsWith(cv)
      case 'ends_with': return value.endsWith(cv)
      case 'exists': return value !== '' && value !== undefined
      case 'not_exists': return value === '' || value === undefined
      default: return false
    }
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
  }

  private async saveOutboundMessage(
    context: FlowContext,
    type: string,
    content: Record<string, unknown>
  ): Promise<void> {
    await this.prisma.message.create({
      data: {
        instanceId: context.instanceId,
        contactId: context.contactId,
        direction: 'outbound',
        type,
        content,
        status: 'sent',
        sentAt: new Date(),
      },
    })
  }

  private async completeExecution(executionId: string, status: string): Promise<void> {
    await this.prisma.flowExecution.update({
      where: { id: executionId },
      data: { status, completedAt: new Date() },
    })
  }
}
