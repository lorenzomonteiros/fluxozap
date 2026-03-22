"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
async function authPlugin(fastify) {
    await fastify.register(jwt_1.default, {
        secret: process.env.JWT_SECRET ?? 'fallback-secret-change-in-production',
        sign: {
            expiresIn: '15m',
        },
    });
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
            if (request.user.type !== 'access') {
                return reply.status(401).send({ error: 'Invalid token type' });
            }
        }
        catch (err) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
        }
    });
}
exports.default = (0, fastify_plugin_1.default)(authPlugin, { name: 'auth' });
