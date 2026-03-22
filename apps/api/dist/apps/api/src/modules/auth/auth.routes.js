"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_service_1 = require("./auth.service");
const shared_1 = require("@flowzap/shared");
async function authRoutes(fastify) {
    const authService = new auth_service_1.AuthService(fastify);
    fastify.post('/register', async (request, reply) => {
        const input = shared_1.registerSchema.parse(request.body);
        try {
            const result = await authService.register(input);
            return reply.status(201).send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' });
        }
    });
    fastify.post('/login', async (request, reply) => {
        const input = shared_1.loginSchema.parse(request.body);
        try {
            const result = await authService.login(input);
            return reply.status(200).send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' });
        }
    });
    fastify.post('/refresh', async (request, reply) => {
        const { refreshToken } = shared_1.refreshTokenSchema.parse(request.body);
        try {
            const result = await authService.refresh(refreshToken);
            return reply.status(200).send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' });
        }
    });
    fastify.post('/logout', async (_request, reply) => {
        return reply.status(200).send({ message: 'Logged out successfully' });
    });
    fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const user = await authService.getMe(request.user.sub);
            return reply.status(200).send(user);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' });
        }
    });
    fastify.put('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const input = shared_1.updateProfileSchema.parse(request.body);
        try {
            const user = await authService.updateProfile(request.user.sub, input);
            return reply.status(200).send(user);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' });
        }
    });
    fastify.put('/change-password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const input = shared_1.changePasswordSchema.parse(request.body);
        try {
            const result = await authService.changePassword(request.user.sub, input.currentPassword, input.newPassword);
            return reply.status(200).send(result);
        }
        catch (err) {
            const e = err;
            return reply.status(e.statusCode ?? 500).send({ error: e.message ?? 'Internal server error' });
        }
    });
}
