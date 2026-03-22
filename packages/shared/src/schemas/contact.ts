import { z } from 'zod'

export const createContactSchema = z.object({
  phone: z
    .string()
    .min(8, 'Phone number too short')
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format'),
  name: z.string().max(100).optional(),
  email: z.string().email('Invalid email').optional().nullable(),
  tags: z.array(z.string()).default([]),
  variables: z.record(z.unknown()).optional(),
})

export const updateContactSchema = createContactSchema.partial()

export const bulkTagSchema = z.object({
  contactIds: z.array(z.string()).min(1, 'At least one contact required'),
  tags: z.array(z.string()).min(1, 'At least one tag required'),
  action: z.enum(['add', 'remove']),
})

export const contactFilterSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  optOut: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type BulkTagInput = z.infer<typeof bulkTagSchema>
export type ContactFilterInput = z.infer<typeof contactFilterSchema>
