"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsRoutes = contactsRoutes;
const contacts_service_1 = require("./contacts.service");
const shared_1 = require("@flowzap/shared");
const zod_1 = require("zod");
async function contactsRoutes(fastify) {
    const service = new contacts_service_1.ContactsService(fastify);
    fastify.addHook('preHandler', fastify.authenticate);
    fastify.get('/contacts', async (request, reply) => {
        const query = zod_1.z.object({
            search: zod_1.z.string().optional(),
            tags: zod_1.z.string().optional(),
            optOut: zod_1.z.string().optional(),
            page: zod_1.z.coerce.number().min(1).default(1),
            limit: zod_1.z.coerce.number().min(1).max(100).default(20),
        }).parse(request.query);
        try {
            const result = await service.getContacts(request.user.sub, {
                search: query.search,
                tags: query.tags ? query.tags.split(',') : undefined,
                optOut: query.optOut !== undefined ? query.optOut === 'true' : undefined,
                page: query.page,
                limit: query.limit,
            });
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/contacts/export', async (request, reply) => {
        try {
            const csv = await service.exportContacts(request.user.sub);
            reply.header('Content-Type', 'text/csv');
            reply.header('Content-Disposition', 'attachment; filename="contacts.csv"');
            return reply.send(csv);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.get('/contacts/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const contact = await service.getContact(request.user.sub, id);
            return reply.send(contact);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/contacts', async (request, reply) => {
        const input = shared_1.createContactSchema.parse(request.body);
        try {
            const contact = await service.createContact(request.user.sub, input);
            return reply.status(201).send(contact);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.put('/contacts/:id', async (request, reply) => {
        const { id } = request.params;
        const input = shared_1.updateContactSchema.parse(request.body);
        try {
            const contact = await service.updateContact(request.user.sub, id, input);
            return reply.send(contact);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.delete('/contacts/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const result = await service.deleteContact(request.user.sub, id);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.patch('/contacts/:id/opt-out', async (request, reply) => {
        const { id } = request.params;
        const { optOut } = zod_1.z.object({ optOut: zod_1.z.boolean() }).parse(request.body);
        try {
            const contact = await service.optOutContact(request.user.sub, id, optOut);
            return reply.send(contact);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/contacts/bulk-tag', async (request, reply) => {
        const input = shared_1.bulkTagSchema.parse(request.body);
        try {
            const result = await service.bulkTagContacts(request.user.sub, input.contactIds, input.tags, input.action);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
    fastify.post('/contacts/import', async (request, reply) => {
        const { csv } = zod_1.z.object({ csv: zod_1.z.string().min(1) }).parse(request.body);
        try {
            const result = await service.importContacts(request.user.sub, csv);
            return reply.send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message });
        }
    });
}
