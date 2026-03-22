"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const db_1 = __importDefault(require("./plugins/db"));
const auth_1 = __importDefault(require("./plugins/auth"));
const socket_1 = __importDefault(require("./plugins/socket"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const whatsapp_routes_1 = require("./modules/whatsapp/whatsapp.routes");
const flows_routes_1 = require("./modules/flows/flows.routes");
const contacts_routes_1 = require("./modules/contacts/contacts.routes");
const messages_routes_1 = require("./modules/messages/messages.routes");
const webhooks_routes_1 = require("./modules/webhooks/webhooks.routes");
const baileys_manager_1 = require("./modules/whatsapp/baileys.manager");
const flow_worker_1 = require("./queues/flow.worker");
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
async function buildServer() {
    const fastify = (0, fastify_1.default)({
        logger: {
            level: process.env.LOG_LEVEL ?? 'info',
            transport: process.env.NODE_ENV !== 'production'
                ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
                : undefined,
        },
        trustProxy: true,
    });
    await fastify.register(cors_1.default, {
        origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    await fastify.register(cookie_1.default);
    await fastify.register(multipart_1.default, { limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50') * 1024 * 1024 } });
    await fastify.register(rate_limit_1.default, { max: 200, timeWindow: '1 minute' });
    await fastify.register(db_1.default);
    await fastify.register(auth_1.default);
    await fastify.register(socket_1.default);
    const flowQueue = (0, flow_worker_1.createFlowQueue)(REDIS_URL);
    const baileysManager = new baileys_manager_1.BaileysManager(fastify.io, fastify.prisma, flowQueue);
    const worker = (0, flow_worker_1.startFlowWorker)(REDIS_URL, fastify.prisma, baileysManager);
    fastify.addHook('onClose', async () => {
        await worker.close();
        await flowQueue.close();
    });
    await fastify.register((0, fastify_plugin_1.default)(async (app) => {
        await app.register(async (instance) => {
            await (0, auth_routes_1.authRoutes)(instance);
        }, { prefix: '/api/auth' });
        await app.register(async (instance) => {
            await (0, whatsapp_routes_1.whatsappRoutes)(instance, { manager: baileysManager });
        }, { prefix: '/api' });
        await app.register(async (instance) => {
            await (0, flows_routes_1.flowsRoutes)(instance);
        }, { prefix: '/api' });
        await app.register(async (instance) => {
            await (0, contacts_routes_1.contactsRoutes)(instance);
        }, { prefix: '/api' });
        await app.register(async (instance) => {
            await (0, messages_routes_1.messagesRoutes)(instance, { manager: baileysManager });
        }, { prefix: '/api' });
        await app.register(async (instance) => {
            await (0, webhooks_routes_1.webhooksRoutes)(instance);
        }, { prefix: '/api' });
    }));
    fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
    fastify.setErrorHandler((error, request, reply) => {
        fastify.log.error(error);
        if (error.name === 'ZodError') {
            return reply.status(400).send({
                error: 'Validation error',
                details: JSON.parse(error.message),
            });
        }
        return reply.status(error.statusCode ?? 500).send({
            error: error.message ?? 'Internal server error',
        });
    });
    return fastify;
}
async function start() {
    const server = await buildServer();
    try {
        await server.listen({ port: PORT, host: '0.0.0.0' });
        server.log.info(`FlowZap API running on port ${PORT}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
start();
