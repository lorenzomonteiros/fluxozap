import { z } from 'zod'

export const messageTypeSchema = z.enum([
  'text',
  'image',
  'audio',
  'video',
  'document',
  'sticker',
  'location',
  'contact',
  'template',
])

export const sendTextMessageSchema = z.object({
  instanceId: z.string().min(1, 'Instance ID is required'),
  to: z
    .string()
    .min(8, 'Phone number too short')
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number'),
  message: z.string().min(1, 'Message cannot be empty').max(4096),
})

export const sendMediaMessageSchema = z.object({
  instanceId: z.string().min(1, 'Instance ID is required'),
  to: z
    .string()
    .min(8, 'Phone number too short')
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number'),
  type: z.enum(['image', 'audio', 'video', 'document']),
  url: z.string().url('Invalid media URL'),
  caption: z.string().max(1024).optional(),
  filename: z.string().max(256).optional(),
})

export const messageFilterSchema = z.object({
  instanceId: z.string().optional(),
  contactId: z.string().optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  type: messageTypeSchema.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
})

export type MessageType = z.infer<typeof messageTypeSchema>
export type SendTextMessageInput = z.infer<typeof sendTextMessageSchema>
export type SendMediaMessageInput = z.infer<typeof sendMediaMessageSchema>
export type MessageFilterInput = z.infer<typeof messageFilterSchema>
