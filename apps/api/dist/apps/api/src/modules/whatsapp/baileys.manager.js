"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaileysManager = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ level: 'silent' });
class BaileysManager {
    instances = new Map();
    io;
    prisma;
    flowQueue;
    sessionsPath;
    constructor(io, prisma, flowQueue) {
        this.io = io;
        this.prisma = prisma;
        this.flowQueue = flowQueue;
        this.sessionsPath = path_1.default.join(process.cwd(), 'sessions');
        if (!fs_1.default.existsSync(this.sessionsPath)) {
            fs_1.default.mkdirSync(this.sessionsPath, { recursive: true });
        }
    }
    async createConnection(instanceId, userId) {
        if (this.instances.has(instanceId)) {
            const existing = this.instances.get(instanceId);
            if (existing.status === 'connected')
                return;
        }
        this.instances.set(instanceId, { socket: null, status: 'connecting', userId });
        this.emitStatus(instanceId, userId, 'connecting');
        try {
            const sessionDir = path_1.default.join(this.sessionsPath, instanceId);
            if (!fs_1.default.existsSync(sessionDir)) {
                fs_1.default.mkdirSync(sessionDir, { recursive: true });
            }
            const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(sessionDir);
            const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
            const socket = (0, baileys_1.default)({
                version,
                logger,
                auth: {
                    creds: state.creds,
                    keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
                },
                printQRInTerminal: false,
                browser: ['FlowZap', 'Chrome', '1.0.0'],
                syncFullHistory: false,
                markOnlineOnConnect: false,
            });
            const instanceState = this.instances.get(instanceId);
            instanceState.socket = socket;
            this.instances.set(instanceId, instanceState);
            socket.ev.on('creds.update', saveCreds);
            socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    const QRCode = await Promise.resolve().then(() => __importStar(require('qrcode')));
                    const qrDataUrl = await QRCode.toDataURL(qr);
                    const state = this.instances.get(instanceId);
                    if (state) {
                        state.status = 'qr_ready';
                        state.qr = qrDataUrl;
                        this.instances.set(instanceId, state);
                    }
                    this.emitStatus(instanceId, userId, 'qr_ready', qrDataUrl);
                    await this.prisma.whatsAppInstance.update({
                        where: { id: instanceId },
                        data: { status: 'qr_ready' },
                    });
                }
                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
                    const state = this.instances.get(instanceId);
                    if (state) {
                        state.status = 'disconnected';
                        state.socket = null;
                        this.instances.set(instanceId, state);
                    }
                    this.emitStatus(instanceId, userId, 'disconnected');
                    await this.prisma.whatsAppInstance.update({
                        where: { id: instanceId },
                        data: { status: 'disconnected' },
                    });
                    if (shouldReconnect) {
                        setTimeout(() => this.createConnection(instanceId, userId), 5000);
                    }
                    else {
                        const sessionDir = path_1.default.join(this.sessionsPath, instanceId);
                        if (fs_1.default.existsSync(sessionDir)) {
                            fs_1.default.rmSync(sessionDir, { recursive: true });
                        }
                    }
                }
                else if (connection === 'open') {
                    const state = this.instances.get(instanceId);
                    if (state) {
                        state.status = 'connected';
                        this.instances.set(instanceId, state);
                    }
                    this.emitStatus(instanceId, userId, 'connected');
                    const profile = socket.user;
                    await this.prisma.whatsAppInstance.update({
                        where: { id: instanceId },
                        data: {
                            status: 'connected',
                            phoneNumber: profile?.id?.split(':')[0] ?? null,
                            profileName: profile?.name ?? null,
                        },
                    });
                }
            });
            socket.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify')
                    return;
                for (const message of messages) {
                    if (message.key.fromMe)
                        continue;
                    await this.handleIncomingMessage(instanceId, userId, message);
                }
            });
        }
        catch (error) {
            console.error(`Failed to create connection for ${instanceId}:`, error);
            this.instances.delete(instanceId);
            this.emitStatus(instanceId, userId, 'disconnected');
        }
    }
    async disconnect(instanceId) {
        const state = this.instances.get(instanceId);
        if (!state?.socket)
            return;
        try {
            await state.socket.logout();
        }
        catch {
            state.socket.end(undefined);
        }
        const sessionDir = path_1.default.join(this.sessionsPath, instanceId);
        if (fs_1.default.existsSync(sessionDir)) {
            fs_1.default.rmSync(sessionDir, { recursive: true });
        }
        this.instances.delete(instanceId);
        await this.prisma.whatsAppInstance.update({
            where: { id: instanceId },
            data: { status: 'disconnected' },
        });
    }
    getStatus(instanceId) {
        return this.instances.get(instanceId)?.status ?? 'disconnected';
    }
    getQR(instanceId) {
        return this.instances.get(instanceId)?.qr;
    }
    async sendTextMessage(instanceId, to, message) {
        const state = this.instances.get(instanceId);
        if (!state?.socket || state.status !== 'connected') {
            throw new Error('Instance not connected');
        }
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await state.socket.sendMessage(jid, { text: message });
    }
    async sendMediaMessage(instanceId, to, type, url, options = {}) {
        const state = this.instances.get(instanceId);
        if (!state?.socket || state.status !== 'connected') {
            throw new Error('Instance not connected');
        }
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        const mediaContent = { url };
        if (options.caption)
            mediaContent.caption = options.caption;
        if (options.filename)
            mediaContent.fileName = options.filename;
        await state.socket.sendMessage(jid, { [type]: mediaContent });
    }
    async handleIncomingMessage(instanceId, userId, message) {
        try {
            const from = message.key.remoteJid ?? '';
            const phone = from.split('@')[0].split(':')[0];
            if (!phone || phone === 'status')
                return;
            const text = message.message?.conversation ??
                message.message?.extendedTextMessage?.text ??
                '';
            let contact = await this.prisma.contact.findUnique({
                where: { userId_phone: { userId, phone } },
            });
            if (!contact) {
                contact = await this.prisma.contact.create({
                    data: {
                        userId,
                        phone,
                        name: message.pushName ?? undefined,
                    },
                });
            }
            await this.prisma.message.create({
                data: {
                    instanceId,
                    contactId: contact.id,
                    direction: 'inbound',
                    type: 'text',
                    content: { text, rawMessage: JSON.stringify(message.message) },
                    status: 'received',
                    sentAt: new Date(),
                },
            });
            this.io.to(`instance:${instanceId}`).emit('message:new', {
                instanceId,
                contact: { id: contact.id, phone, name: contact.name },
                message: { text, timestamp: message.messageTimestamp },
            });
            if (contact.optOut)
                return;
            const activeFlows = await this.prisma.flow.findMany({
                where: { userId, isActive: true },
            });
            for (const flow of activeFlows) {
                const trigger = flow.trigger;
                if (trigger.instanceId && trigger.instanceId !== instanceId)
                    continue;
                let matches = false;
                if (trigger.type === 'any_message') {
                    matches = true;
                }
                else if (trigger.type === 'keyword' && trigger.value) {
                    const keyword = trigger.value.toLowerCase();
                    matches = text.toLowerCase().includes(keyword);
                }
                else if (trigger.type === 'first_message') {
                    const count = await this.prisma.message.count({
                        where: { instanceId, contactId: contact.id, direction: 'inbound' },
                    });
                    matches = count === 1;
                }
                if (matches) {
                    await this.flowQueue.add('execute-flow', {
                        flowId: flow.id,
                        contactId: contact.id,
                        instanceId,
                        triggerData: { text, phone, messageTimestamp: message.messageTimestamp },
                    });
                }
            }
        }
        catch (error) {
            console.error('Error handling incoming message:', error);
        }
    }
    emitStatus(instanceId, userId, status, qr) {
        const payload = { instanceId, status, qr };
        this.io.to(`instance:${instanceId}`).emit('instance:status', payload);
        this.io.to(`user:${userId}`).emit('instance:status', payload);
    }
}
exports.BaileysManager = BaileysManager;
