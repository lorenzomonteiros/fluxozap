import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { BaileysManager } from '../whatsapp/baileys.manager'

export class MessagesService {
  private prisma: PrismaClient
  private manager: BaileysManager

  constructor(fastify: FastifyInstance, manager: BaileysManager) {
    this.prisma = fastify.prisma
    this.manager = manager
  }

  async getMessages(
    userId: string,
    opts: {
      instanceId?: string
      contactId?: string
      direction?: string
      type?: string
      page?: number
      limit?: number
    }
  ) {
    const page = opts.page ?? 1
    const limit = opts.limit ?? 50
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (opts.instanceId) {
      const instance = await this.prisma.whatsAppInstance.findFirst({
        where: { id: opts.instanceId, userId },
      })
      if (!instance) throw { statusCode: 404, message: 'Instance not found' }
      where.instanceId = opts.instanceId
    } else {
      where.instance = { userId }
    }

    if (opts.contactId) where.contactId = opts.contactId
    if (opts.direction) where.direction = opts.direction
    if (opts.type) where.type = opts.type

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, phone: true, name: true } },
          instance: { select: { id: true, name: true } },
        },
      }),
      this.prisma.message.count({ where }),
    ])

    return {
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  }

  async sendMessage(
    userId: string,
    instanceId: string,
    to: string,
    message: string
  ) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, userId },
    })
    if (!instance) throw { statusCode: 404, message: 'Instance not found' }

    await this.manager.sendTextMessage(instanceId, to, message)

    const phone = to.replace('@s.whatsapp.net', '').split(':')[0]
    let contact = await this.prisma.contact.findUnique({
      where: { userId_phone: { userId, phone } },
    })

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: { userId, phone },
      })
    }

    const saved = await this.prisma.message.create({
      data: {
        instanceId,
        contactId: contact.id,
        direction: 'outbound',
        type: 'text',
        content: { text: message },
        status: 'sent',
        sentAt: new Date(),
      },
      include: {
        contact: { select: { id: true, phone: true, name: true } },
      },
    })

    return saved
  }

  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { instance: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        contact: { select: { id: true, phone: true, name: true } },
        instance: { select: { id: true, name: true } },
      },
    })

    const conversationMap = new Map<string, typeof messages[0]>()
    for (const msg of messages) {
      if (!msg.contactId) continue
      if (!conversationMap.has(msg.contactId)) {
        conversationMap.set(msg.contactId, msg)
      }
    }

    return Array.from(conversationMap.values()).slice(0, 50)
  }
}
