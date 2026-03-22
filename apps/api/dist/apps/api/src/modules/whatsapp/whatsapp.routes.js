"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappRoutes = whatsappRoutes;
const whatsapp_service_1 = require("./whatsapp.service");
const zod_1 = require("zod");
async function whatsappRoutes(fastify, options) {
    const service = new whatsapp_service_1.WhatsAppService(fastify, options.manager);
    fastify.addHook('preHandler', fastify.authenticate);
    fastify.get('/instances', async (request, reply) => {
        try {
            const instances = await service.getInstances(request.user.sub);
            return reply.send(instances);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/instances', async (request, reply) => {
        const { name } = zod_1.z.object({ name: zod_1.z.string().min(1).max(100) }).parse(request.body);
        try {
            const instance = await service.createInstance(request.user.sub, name);
            return reply.status(201).send(instance);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.delete('/instances/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const result = await service.deleteInstance(request.user.sub, id);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/instances/:id/connect', async (request, reply) => {
        const { id } = request.params;
        try {
            const result = await service.connectInstance(request.user.sub, id);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/instances/:id/disconnect', async (request, reply) => {
        const { id } = request.params;
        try {
            const result = await service.disconnectInstance(request.user.sub, id);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/instances/:id/status', async (request, reply) => {
        const { id } = request.params;
        try {
            const status = await service.getInstanceStatus(request.user.sub, id);
            return reply.send(status);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
}
