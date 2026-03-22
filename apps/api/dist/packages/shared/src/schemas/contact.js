"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactFilterSchema = exports.bulkTagSchema = exports.updateContactSchema = exports.createContactSchema = void 0;
const zod_1 = require("zod");
exports.createContactSchema = zod_1.z.object({
    phone: zod_1.z
        .string()
        .min(8, 'Phone number too short')
        .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format'),
    name: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().email('Invalid email').optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    variables: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.updateContactSchema = exports.createContactSchema.partial();
exports.bulkTagSchema = zod_1.z.object({
    contactIds: zod_1.z.array(zod_1.z.string()).min(1, 'At least one contact required'),
    tags: zod_1.z.array(zod_1.z.string()).min(1, 'At least one tag required'),
    action: zod_1.z.enum(['add', 'remove']),
});
exports.contactFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    optOut: zod_1.z.boolean().optional(),
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
});
