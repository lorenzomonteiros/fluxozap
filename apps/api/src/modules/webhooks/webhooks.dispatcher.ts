import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { generateHmac } from '../../lib/crypto'

export class WebhookDispatcher {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async dispatch(userId: string, event: string, payload: Record<string, unknown>) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        userId,
        isActive: true,
        events: { has: event },
      },
    })

    const dispatches = webhooks.map((webhook) => this.send(webhook, event, payload))
    await Promise.allSettled(dispatches)
  }

  private async send(
    webhook: { id: string; url: string; secret: string | null },
    event: string,
    payload: Record<string, unknown>
  ) {
    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-FlowZap-Event': event,
      'X-FlowZap-Timestamp': new Date().toISOString(),
    }

    if (webhook.secret) {
      headers['X-FlowZap-Signature'] = `sha256=${generateHmac(body, webhook.secret)}`
    }

    let statusCode: number | null = null
    let responseText: string | null = null
    let success = false

    try {
      const response = await axios.post(webhook.url, body, {
        headers,
        timeout: 10000,
        validateStatus: () => true,
      })
      statusCode = response.status
      responseText = JSON.stringify(response.data).substring(0, 500)
      success = response.status >= 200 && response.status < 300
    } catch (err: unknown) {
      const error = err as Error
      responseText = error.message
      success = false
    }

    await this.prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        statusCode,
        response: responseText,
        success,
      },
    })
  }
}
