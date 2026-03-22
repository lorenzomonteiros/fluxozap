import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { BaileysManager } from './baileys.manager'

export class WhatsAppService {
  private prisma: PrismaClient
  private manager: BaileysManager

  constructor(fastify: FastifyInstance, manager: BaileysManager) {
    this.prisma = fastify.prisma
    this.manager = manager
  }

  async getInstances(userId: string) {
    const instances = await this.prisma.whatsAppInstance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return instances.map((instance) => ({
      ...instance,
      status: this.manager.getStatus(instance.id) ?? instance.status,
    }))
  }

  async createInstance(userId: string, name: string) {
    const instance = await this.prisma.whatsAppInstance.create({
      data: { userId, name, status: 'disconnected' },
    })
    return instance
  }

  async deleteInstance(userId: string, instanceId: string) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, userId },
    })

    if (!instance) {
      throw { statusCode: 404, message: 'Instance not found' }
    }

    try {
      await this.manager.disconnect(instanceId)
    } catch {
      // ignore disconnect errors on delete
    }

    await this.prisma.whatsAppInstance.delete({ where: { id: instanceId } })
    return { message: 'Instance deleted successfully' }
  }

  async connectInstance(userId: string, instanceId: string) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, userId },
    })

    if (!instance) {
      throw { statusCode: 404, message: 'Instance not found' }
    }

    await this.manager.createConnection(instanceId, userId)
    return { message: 'Connection initiated', instanceId }
  }

  async disconnectInstance(userId: string, instanceId: string) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, userId },
    })

    if (!instance) {
      throw { statusCode: 404, message: 'Instance not found' }
    }

    await this.manager.disconnect(instanceId)
    return { message: 'Instance disconnected', instanceId }
  }

  async getInstanceStatus(userId: string, instanceId: string) {
    const instance = await this.prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, userId },
    })

    if (!instance) {
      throw { statusCode: 404, message: 'Instance not found' }
    }

    const status = this.manager.getStatus(instanceId)
    const qr = this.manager.getQR(instanceId)

    return {
      instanceId,
      status,
      qr,
      phoneNumber: instance.phoneNumber,
      profileName: instance.profileName,
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

    if (!instance) {
      throw { statusCode: 404, message: 'Instance not found' }
    }

    await this.manager.sendTextMessage(instanceId, to, message)

    const phone = to.split('@')[0].split(':')[0]
    let contact = await this.prisma.contact.findUnique({
      where: { userId_phone: { userId, phone } },
    })

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: { userId, phone },
      })
    }

    const savedMessage = await this.prisma.message.create({
      data: {
        instanceId,
        contactId: contact.id,
        direction: 'outbound',
        type: 'text',
        content: { text: message },
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return savedMessage
  }
}
