"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
async function socketPlugin(fastify) {
    const httpServer = (0, http_1.createServer)(fastify.server);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });
    io.on('connection', (socket) => {
        fastify.log.info(`Socket connected: ${socket.id}`);
        socket.on('join:instance', (instanceId) => {
            socket.join(`instance:${instanceId}`);
        });
        socket.on('join:user', (userId) => {
            socket.join(`user:${userId}`);
        });
        socket.on('disconnect', () => {
            fastify.log.info(`Socket disconnected: ${socket.id}`);
        });
    });
    fastify.decorate('io', io);
    fastify.addHook('onClose', () => {
        io.close();
    });
}
exports.default = (0, fastify_plugin_1.default)(socketPlugin, { name: 'socket' });
