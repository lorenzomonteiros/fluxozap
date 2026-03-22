"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksRoutes = webhooksRoutes;
const webhooks_service_1 = require("./webhooks.service");
const zod_1 = require("zod");
async function webhooksRoutes(fastify) {
    const service = new webhooks_service_1.WebhooksService(fastify);
    fastify.addHook('preHandler', fastify.authenticate);
    fastify.get('/webhooks', async (request, reply) => {
        try {
            const webhooks = await service.getWebhooks(request.user.sub);
            return reply.send(webhooks);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/webhooks/events', async (request, reply) => {
        const events = await service.getAvailableEvents();
        return reply.send(events);
    });
    fastify.get('/webhooks/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const webhook = await service.getWebhook(request.user.sub, id);
            return reply.send(webhook);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/webhooks', async (request, reply) => {
        const body = zod_1.z.object({
            name: zod_1.z.string().min(1).max(100),
            url: zod_1.z.string().url(),
            secret: zod_1.z.string().optional(),
            events: zod_1.z.array(zod_1.z.string()).min(1),
        }).parse(request.body);
        try {
            const webhook = await service.createWebhook(request.user.sub, body);
            return reply.status(201).send(webhook);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.put('/webhooks/:id', async (request, reply) => {
        const { id } = request.params;
        const body = zod_1.z.object({
            name: zod_1.z.string().min(1).max(100).optional(),
            url: zod_1.z.string().url().optional(),
            secret: zod_1.z.string().optional(),
            events: zod_1.z.array(zod_1.z.string()).optional(),
            isActive: zod_1.z.boolean().optional(),
        }).parse(request.body);
        try {
            const webhook = await service.updateWebhook(request.user.sub, id, body);
            return reply.send(webhook);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.delete('/webhooks/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const result = await service.deleteWebhook(request.user.sub, id);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/webhooks/:id/logs', async (request, reply) => {
        const { id } = request.params;
        try {
            const logs = await service.getWebhookLogs(request.user.sub, id);
            return reply.send(logs);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
}
