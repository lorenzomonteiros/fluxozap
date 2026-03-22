"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
class WebhooksService {
    prisma;
    constructor(fastify) {
        this.prisma = fastify.prisma;
    }
    async getWebhooks(userId) {
        return this.prisma.webhook.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getWebhook(userId, webhookId) {
        const webhook = await this.prisma.webhook.findFirst({
            where: { id: webhookId, userId },
        });
        if (!webhook)
            throw { statusCode: 404, message: 'Webhook not found' };
        return webhook;
    }
    async createWebhook(userId, data) {
        return this.prisma.webhook.create({
            data: {
                userId,
                name: data.name,
                url: data.url,
                secret: data.secret ?? null,
                events: data.events,
                isActive: true,
            },
        });
    }
    async updateWebhook(userId, webhookId, data) {
        const existing = await this.prisma.webhook.findFirst({ where: { id: webhookId, userId } });
        if (!existing)
            throw { statusCode: 404, message: 'Webhook not found' };
        return this.prisma.webhook.update({
            where: { id: webhookId },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.url !== undefined && { url: data.url }),
                ...(data.secret !== undefined && { secret: data.secret }),
                ...(data.events !== undefined && { events: data.events }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });
    }
    async deleteWebhook(userId, webhookId) {
        const existing = await this.prisma.webhook.findFirst({ where: { id: webhookId, userId } });
        if (!existing)
            throw { statusCode: 404, message: 'Webhook not found' };
        await this.prisma.webhook.delete({ where: { id: webhookId } });
        return { message: 'Webhook deleted successfully' };
    }
    async getWebhookLogs(userId, webhookId) {
        const webhook = await this.prisma.webhook.findFirst({ where: { id: webhookId, userId } });
        if (!webhook)
            throw { statusCode: 404, message: 'Webhook not found' };
        return this.prisma.webhookLog.findMany({
            where: { webhookId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getAvailableEvents() {
        return [
            { event: 'message.received', description: 'Fired when a message is received' },
            { event: 'message.sent', description: 'Fired when a message is sent' },
            { event: 'flow.started', description: 'Fired when a flow execution starts' },
            { event: 'flow.completed', description: 'Fired when a flow execution completes' },
            { event: 'flow.failed', description: 'Fired when a flow execution fails' },
            { event: 'contact.created', description: 'Fired when a new contact is created' },
            { event: 'instance.connected', description: 'Fired when an instance connects' },
            { event: 'instance.disconnected', description: 'Fired when an instance disconnects' },
        ];
    }
}
exports.WebhooksService = WebhooksService;
