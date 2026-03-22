"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRoutes = messagesRoutes;
const messages_service_1 = require("./messages.service");
const zod_1 = require("zod");
async function messagesRoutes(fastify, options) {
    const service = new messages_service_1.MessagesService(fastify, options.manager);
    fastify.addHook('preHandler', fastify.authenticate);
    fastify.get('/messages', async (request, reply) => {
        const query = zod_1.z.object({
            instanceId: zod_1.z.string().optional(),
            contactId: zod_1.z.string().optional(),
            direction: zod_1.z.enum(['inbound', 'outbound']).optional(),
            type: zod_1.z.string().optional(),
            page: zod_1.z.coerce.number().min(1).default(1),
            limit: zod_1.z.coerce.number().min(1).max(100).default(50),
        }).parse(request.query);
        try {
            const result = await service.getMessages(request.user.sub, query);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/messages/conversations', async (request, reply) => {
        try {
            const conversations = await service.getConversations(request.user.sub);
            return reply.send(conversations);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/messages/send', async (request, reply) => {
        const body = zod_1.z.object({
            instanceId: zod_1.z.string(),
            to: zod_1.z.string(),
            message: zod_1.z.string().min(1),
        }).parse(request.body);
        try {
            const result = await service.sendMessage(request.user.sub, body.instanceId, body.to, body.message);
            return reply.status(201).send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
}
