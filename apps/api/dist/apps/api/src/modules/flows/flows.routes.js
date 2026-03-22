"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowsRoutes = flowsRoutes;
const flows_service_1 = require("./flows.service");
const shared_1 = require("@flowzap/shared");
async function flowsRoutes(fastify) {
    const service = new flows_service_1.FlowsService(fastify);
    fastify.addHook('preHandler', fastify.authenticate);
    fastify.get('/flows', async (request, reply) => {
        try {
            const flows = await service.getFlows(request.user.sub);
            return reply.send(flows);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/flows/stats', async (request, reply) => {
        try {
            const stats = await service.getStats(request.user.sub);
            return reply.send(stats);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/flows/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const flow = await service.getFlow(request.user.sub, id);
            return reply.send(flow);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/flows', async (request, reply) => {
        const input = shared_1.createFlowSchema.parse(request.body);
        try {
            const flow = await service.createFlow(request.user.sub, input);
            return reply.status(201).send(flow);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.put('/flows/:id', async (request, reply) => {
        const { id } = request.params;
        const input = shared_1.updateFlowSchema.parse(request.body);
        try {
            const flow = await service.updateFlow(request.user.sub, id, input);
            return reply.send(flow);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.delete('/flows/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const result = await service.deleteFlow(request.user.sub, id);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.patch('/flows/:id/toggle', async (request, reply) => {
        const { id } = request.params;
        const { isActive } = shared_1.toggleFlowSchema.parse(request.body);
        try {
            const flow = await service.toggleFlow(request.user.sub, id, isActive);
            return reply.send(flow);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/flows/:id/executions', async (request, reply) => {
        const { id } = request.params;
        try {
            const executions = await service.getExecutions(request.user.sub, id);
            return reply.send(executions);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
}
