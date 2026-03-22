import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  proto,
  WASocket,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { Queue } from 'bullmq'
import path from 'path'
import fs from 'fs'
import pino from 'pino'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'qr_ready'

interface InstanceState {
  socket: WASocket | null
  status: ConnectionStatus
  qr?: string
  userId: string
}

const logger = pino({ level: 'silent' })

export class BaileysManager {
  private instances: Map<string, InstanceState> = new Map()
  private io: SocketIOServer
  private prisma: PrismaClient
  private flowQueue: Queue
  private sessionsPath: string

  constructor(io: SocketIOServer, prisma: PrismaClient, flowQueue: Queue) {
    this.io = io
    this.prisma = prisma
    this.flowQueue = flowQueue
    this.sessionsPath = path.join(process.cwd(), 'sessions')
    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true })
    }
  }

  async createConnection(instanceId: string, userId: string): Promise<void> {
    if (this.instances.has(instanceId)) {
      const existing = this.instances.get(instanceId)!
      if (existing.status === 'connected') return
    }

    this.instances.set(instanceId, { socket: null, status: 'connecting', userId })
    this.emitStatus(instanceId, userId, 'connecting')

    try {
      const sessionDir = path.join(this.sessionsPath, instanceId)
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true })
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
      const { version } = await fetchLatestBaileysVersion()

      const socket = makeWASocket({
        version,
        logger,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        browser: ['FlowZap', 'Chrome', '1.0.0'],
        syncFullHistory: false,
        markOnlineOnConnect: false,
      })

      const instanceState = this.instances.get(instanceId)!
      instanceState.socket = socket
      this.instances.set(instanceId, instanceState)

      socket.ev.on('creds.update', saveCreds)

      socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          const QRCode = await import('qrcode')
          const qrDataUrl = await QRCode.toDataURL(qr)
          const state = this.instances.get(instanceId)
          if (state) {
            state.status = 'qr_ready'
            state.qr = qrDataUrl
            this.instances.set(instanceId, state)
          }
          this.emitStatus(instanceId, userId, 'qr_ready', qrDataUrl)

          await this.prisma.whatsAppInstance.update({
            where: { id: instanceId },
            data: { status: 'qr_ready' },
          })
        }

        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut

          const state = this.instances.get(instanceId)
          if (state) {
            state.status = 'disconnected'
            state.socket = null
            this.instances.set(instanceId, state)
          }

          this.emitStatus(instanceId, userId, 'disconnected')

          await this.prisma.whatsAppInstance.update({
            where: { id: instanceId },
            data: { status: 'disconnected' },
          })

          if (shouldReconnect) {
            setTimeout(() => this.createConnection(instanceId, userId), 5000)
          } else {
            const sessionDir = path.join(this.sessionsPath, instanceId)
            if (fs.existsSync(sessionDir)) {
              fs.rmSync(sessionDir, { recursive: true })
            }
          }
        } else if (connection === 'open') {
          const state = this.instances.get(instanceId)
          if (state) {
            state.status = 'connected'
            this.instances.set(instanceId, state)
          }
          this.emitStatus(instanceId, userId, 'connected')

          const profile = socket.user
          await this.prisma.whatsAppInstance.update({
            where: { id: instanceId },
            data: {
              status: 'connected',
              phoneNumber: profile?.id?.split(':')[0] ?? null,
              profileName: profile?.name ?? null,
            },
          })
        }
      })

      socket.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return

        for (const message of messages) {
          if (message.key.fromMe) continue
          await this.handleIncomingMessage(instanceId, userId, message)
        }
      })
    } catch (error) {
      console.error(`Failed to create connection for ${instanceId}:`, error)
      this.instances.delete(instanceId)
      this.emitStatus(instanceId, userId, 'disconnected')
    }
  }

  async disconnect(instanceId: string): Promise<void> {
    const state = this.instances.get(instanceId)
    if (!state?.socket) return

    try {
      await state.socket.logout()
    } catch {
      state.socket.end(undefined)
    }

    const sessionDir = path.join(this.sessionsPath, instanceId)
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true })
    }

    this.instances.delete(instanceId)

    await this.prisma.whatsAppInstance.update({
      where: { id: instanceId },
      data: { status: 'disconnected' },
    })
  }

  getStatus(instanceId: string): ConnectionStatus {
    return this.instances.get(instanceId)?.status ?? 'disconnected'
  }

  getQR(instanceId: string): string | undefined {
    return this.instances.get(instanceId)?.qr
  }

  async sendTextMessage(instanceId: string, to: string, message: string): Promise<void> {
    const state = this.instances.get(instanceId)
    if (!state?.socket || state.status !== 'connected') {
      throw new Error('Instance not connected')
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`
    await state.socket.sendMessage(jid, { text: message })
  }

  async sendMediaMessage(
    instanceId: string,
    to: string,
    type: 'image' | 'audio' | 'video' | 'document',
    url: string,
    options: { caption?: string; filename?: string } = {}
  ): Promise<void> {
    const state = this.instances.get(instanceId)
    if (!state?.socket || state.status !== 'connected') {
      throw new Error('Instance not connected')
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`

    const mediaContent: Record<string, unknown> = { url }
    if (options.caption) mediaContent.caption = options.caption
    if (options.filename) mediaContent.fileName = options.filename

    await state.socket.sendMessage(jid, { [type]: mediaContent } as Parameters<typeof state.socket.sendMessage>[1])
  }

  private async handleIncomingMessage(
    instanceId: string,
    userId: string,
    message: proto.IWebMessageInfo
  ): Promise<void> {
    try {
      const from = message.key.remoteJid ?? ''
      const phone = from.split('@')[0].split(':')[0]
      if (!phone || phone === 'status') return

      const text =
        message.message?.conversation ??
        message.message?.extendedTextMessage?.text ??
        ''

      let contact = await this.prisma.contact.findUnique({
        where: { userId_phone: { userId, phone } },
      })

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            userId,
            phone,
            name: message.pushName ?? undefined,
          },
        })
      }

      await this.prisma.message.create({
        data: {
          instanceId,
          contactId: contact.id,
          direction: 'inbound',
          type: 'text',
          content: { text, rawMessage: JSON.stringify(message.message) },
          status: 'received',
          sentAt: new Date(),
        },
      })

      this.io.to(`instance:${instanceId}`).emit('message:new', {
        instanceId,
        contact: { id: contact.id, phone, name: contact.name },
        message: { text, timestamp: message.messageTimestamp },
      })

      if (contact.optOut) return

      const activeFlows = await this.prisma.flow.findMany({
        where: { userId, isActive: true },
      })

      for (const flow of activeFlows) {
        const trigger = flow.trigger as { type: string; value?: string; instanceId?: string }

        if (trigger.instanceId && trigger.instanceId !== instanceId) continue

        let matches = false
        if (trigger.type === 'any_message') {
          matches = true
        } else if (trigger.type === 'keyword' && trigger.value) {
          const keyword = trigger.value.toLowerCase()
          matches = text.toLowerCase().includes(keyword)
        } else if (trigger.type === 'first_message') {
          const count = await this.prisma.message.count({
            where: { instanceId, contactId: contact.id, direction: 'inbound' },
          })
          matches = count === 1
        }

        if (matches) {
          await this.flowQueue.add('execute-flow', {
            flowId: flow.id,
            contactId: contact.id,
            instanceId,
            triggerData: { text, phone, messageTimestamp: message.messageTimestamp },
          })
        }
      }
    } catch (error) {
      console.error('Error handling incoming message:', error)
    }
  }

  private emitStatus(
    instanceId: string,
    userId: string,
    status: ConnectionStatus,
    qr?: string
  ): void {
    const payload = { instanceId, status, qr }
    this.io.to(`instance:${instanceId}`).emit('instance:status', payload)
    this.io.to(`user:${userId}`).emit('instance:status', payload)
  }
}
