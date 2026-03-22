"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDispatcher = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("../../lib/crypto");
class WebhookDispatcher {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dispatch(userId, event, payload) {
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                userId,
                isActive: true,
                events: { has: event },
            },
        });
        const dispatches = webhooks.map((webhook) => this.send(webhook, event, payload));
        await Promise.allSettled(dispatches);
    }
    async send(webhook, event, payload) {
        const body = JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload,
        });
        const headers = {
            'Content-Type': 'application/json',
            'X-FlowZap-Event': event,
            'X-FlowZap-Timestamp': new Date().toISOString(),
        };
        if (webhook.secret) {
            headers['X-FlowZap-Signature'] = `sha256=${(0, crypto_1.generateHmac)(body, webhook.secret)}`;
        }
        let statusCode = null;
        let responseText = null;
        let success = false;
        try {
            const response = await axios_1.default.post(webhook.url, body, {
                headers,
                timeout: 10000,
                validateStatus: () => true,
            });
            statusCode = response.status;
            responseText = JSON.stringify(response.data).substring(0, 500);
            success = response.status >= 200 && response.status < 300;
        }
        catch (err) {
            const error = err;
            responseText = error.message;
            success = false;
        }
        await this.prisma.webhookLog.create({
            data: {
                webhookId: webhook.id,
                event,
                payload: payload,
                statusCode,
                response: responseText,
                success,
            },
        });
    }
}
exports.WebhookDispatcher = WebhookDispatcher;
