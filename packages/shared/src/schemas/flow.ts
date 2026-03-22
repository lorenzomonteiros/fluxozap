import { z } from 'zod'

export const triggerTypeSchema = z.enum([
  'keyword',
  'any_message',
  'first_message',
  'button_reply',
  'list_reply',
])

export const triggerSchema = z.object({
  type: triggerTypeSchema,
  value: z.string().optional(),
  instanceId: z.string().optional(),
})

export const nodeTypeSchema = z.enum([
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
])

export const baseNodeDataSchema = z.object({
  label: z.string(),
})

export const textMessageDataSchema = baseNodeDataSchema.extend({
  message: z.string().min(1, 'Message cannot be empty'),
})

export const imageDataSchema = baseNodeDataSchema.extend({
  url: z.string().url('Invalid image URL'),
  caption: z.string().optional(),
})

export const audioDataSchema = baseNodeDataSchema.extend({
  url: z.string().url('Invalid audio URL'),
})

export const videoDataSchema = baseNodeDataSchema.extend({
  url: z.string().url('Invalid video URL'),
  caption: z.string().optional(),
})

export const documentDataSchema = baseNodeDataSchema.extend({
  url: z.string().url('Invalid document URL'),
  filename: z.string().min(1, 'Filename is required'),
  caption: z.string().optional(),
})

export const delayDataSchema = baseNodeDataSchema.extend({
  duration: z.number().int().min(1, 'Duration must be at least 1'),
  unit: z.enum(['seconds', 'minutes', 'hours']),
})

export const conditionDataSchema = baseNodeDataSchema.extend({
  variable: z.string().min(1, 'Variable name is required'),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'exists', 'not_exists']),
  value: z.string().optional(),
})

export const tagActionDataSchema = baseNodeDataSchema.extend({
  action: z.enum(['add', 'remove']),
  tag: z.string().min(1, 'Tag name is required'),
})

export const saveVariableDataSchema = baseNodeDataSchema.extend({
  variableName: z.string().min(1, 'Variable name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Variable name must be alphanumeric'),
  source: z.enum(['last_message', 'static', 'expression']),
  value: z.string().optional(),
})

export const webhookNodeDataSchema = baseNodeDataSchema.extend({
  url: z.string().url('Invalid webhook URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  saveResponseAs: z.string().optional(),
})

export const flowNodeSchema = z.object({
  id: z.string(),
  type: nodeTypeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.unknown()),
})

export const flowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional().nullable(),
  targetHandle: z.string().optional().nullable(),
  label: z.string().optional(),
})

export const createFlowSchema = z.object({
  name: z.string().min(1, 'Flow name is required').max(100),
  description: z.string().max(500).optional(),
  trigger: triggerSchema,
  nodes: z.array(flowNodeSchema).default([]),
  edges: z.array(flowEdgeSchema).default([]),
})

export const updateFlowSchema = createFlowSchema.partial()

export const toggleFlowSchema = z.object({
  isActive: z.boolean(),
})

export type TriggerType = z.infer<typeof triggerTypeSchema>
export type Trigger = z.infer<typeof triggerSchema>
export type NodeType = z.infer<typeof nodeTypeSchema>
export type FlowNode = z.infer<typeof flowNodeSchema>
export type FlowEdge = z.infer<typeof flowEdgeSchema>
export type CreateFlowInput = z.infer<typeof createFlowSchema>
export type UpdateFlowInput = z.infer<typeof updateFlowSchema>
