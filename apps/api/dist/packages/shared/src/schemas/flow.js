"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFlowSchema = exports.updateFlowSchema = exports.createFlowSchema = exports.flowEdgeSchema = exports.flowNodeSchema = exports.webhookNodeDataSchema = exports.saveVariableDataSchema = exports.tagActionDataSchema = exports.conditionDataSchema = exports.delayDataSchema = exports.documentDataSchema = exports.videoDataSchema = exports.audioDataSchema = exports.imageDataSchema = exports.textMessageDataSchema = exports.baseNodeDataSchema = exports.nodeTypeSchema = exports.triggerSchema = exports.triggerTypeSchema = void 0;
const zod_1 = require("zod");
exports.triggerTypeSchema = zod_1.z.enum([
    'keyword',
    'any_message',
    'first_message',
    'button_reply',
    'list_reply',
]);
exports.triggerSchema = zod_1.z.object({
    type: exports.triggerTypeSchema,
    value: zod_1.z.string().optional(),
    instanceId: zod_1.z.string().optional(),
});
exports.nodeTypeSchema = zod_1.z.enum([
    'trigger',
    'text_message',
    'image',
    'audio',
    'video',
    'document',
    'delay',
    'condition',
    'tag_action',
    'save_variable',
    'webhook',
    'end',
]);
exports.baseNodeDataSchema = zod_1.z.object({
    label: zod_1.z.string(),
});
exports.textMessageDataSchema = exports.baseNodeDataSchema.extend({
    message: zod_1.z.string().min(1, 'Message cannot be empty'),
});
exports.imageDataSchema = exports.baseNodeDataSchema.extend({
    url: zod_1.z.string().url('Invalid image URL'),
    caption: zod_1.z.string().optional(),
});
exports.audioDataSchema = exports.baseNodeDataSchema.extend({
    url: zod_1.z.string().url('Invalid audio URL'),
});
exports.videoDataSchema = exports.baseNodeDataSchema.extend({
    url: zod_1.z.string().url('Invalid video URL'),
    caption: zod_1.z.string().optional(),
});
exports.documentDataSchema = exports.baseNodeDataSchema.extend({
    url: zod_1.z.string().url('Invalid document URL'),
    filename: zod_1.z.string().min(1, 'Filename is required'),
    caption: zod_1.z.string().optional(),
});
exports.delayDataSchema = exports.baseNodeDataSchema.extend({
    duration: zod_1.z.number().int().min(1, 'Duration must be at least 1'),
    unit: zod_1.z.enum(['seconds', 'minutes', 'hours']),
});
exports.conditionDataSchema = exports.baseNodeDataSchema.extend({
    variable: zod_1.z.string().min(1, 'Variable name is required'),
    operator: zod_1.z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'exists', 'not_exists']),
    value: zod_1.z.string().optional(),
});
exports.tagActionDataSchema = exports.baseNodeDataSchema.extend({
    action: zod_1.z.enum(['add', 'remove']),
    tag: zod_1.z.string().min(1, 'Tag name is required'),
});
exports.saveVariableDataSchema = exports.baseNodeDataSchema.extend({
    variableName: zod_1.z.string().min(1, 'Variable name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Variable name must be alphanumeric'),
    source: zod_1.z.enum(['last_message', 'static', 'expression']),
    value: zod_1.z.string().optional(),
});
exports.webhookNodeDataSchema = exports.baseNodeDataSchema.extend({
    url: zod_1.z.string().url('Invalid webhook URL'),
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    headers: zod_1.z.record(zod_1.z.string()).optional(),
    body: zod_1.z.string().optional(),
    saveResponseAs: zod_1.z.string().optional(),
});
exports.flowNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: exports.nodeTypeSchema,
    position: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }),
    data: zod_1.z.record(zod_1.z.unknown()),
});
exports.flowEdgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    target: zod_1.z.string(),
    sourceHandle: zod_1.z.string().optional().nullable(),
    targetHandle: zod_1.z.string().optional().nullable(),
    label: zod_1.z.string().optional(),
});
exports.createFlowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Flow name is required').max(100),
    description: zod_1.z.string().max(500).optional(),
    trigger: exports.triggerSchema,
    nodes: zod_1.z.array(exports.flowNodeSchema).default([]),
    edges: zod_1.z.array(exports.flowEdgeSchema).default([]),
});
exports.updateFlowSchema = exports.createFlowSchema.partial();
exports.toggleFlowSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
