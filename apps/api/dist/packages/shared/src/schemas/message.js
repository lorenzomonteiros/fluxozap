"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageFilterSchema = exports.sendMediaMessageSchema = exports.sendTextMessageSchema = exports.messageTypeSchema = void 0;
const zod_1 = require("zod");
exports.messageTypeSchema = zod_1.z.enum([
    'text',
    'image',
    'audio',
    'video',
    'document',
    'sticker',
    'location',
    'contact',
    'template',
]);
exports.sendTextMessageSchema = zod_1.z.object({
    instanceId: zod_1.z.string().min(1, 'Instance ID is required'),
    to: zod_1.z
        .string()
        .min(8, 'Phone number too short')
        .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number'),
    message: zod_1.z.string().min(1, 'Message cannot be empty').max(4096),
});
exports.sendMediaMessageSchema = zod_1.z.object({
    instanceId: zod_1.z.string().min(1, 'Instance ID is required'),
    to: zod_1.z
        .string()
        .min(8, 'Phone number too short')
        .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number'),
    type: zod_1.z.enum(['image', 'audio', 'video', 'document']),
    url: zod_1.z.string().url('Invalid media URL'),
    caption: zod_1.z.string().max(1024).optional(),
    filename: zod_1.z.string().max(256).optional(),
});
exports.messageFilterSchema = zod_1.z.object({
    instanceId: zod_1.z.string().optional(),
    contactId: zod_1.z.string().optional(),
    direction: zod_1.z.enum(['inbound', 'outbound']).optional(),
    type: exports.messageTypeSchema.optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(50),
});
