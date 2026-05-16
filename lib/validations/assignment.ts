import { z } from 'zod'

export const assignmentSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  due_date: z.string().date().optional().or(z.literal('')),
  resource_type: z.enum(['drive_link', 'download', 'external_link']).optional(),
  resource_url: z.string().url().optional().or(z.literal('')),
  file_url: z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['public', 'link_only', 'restricted', 'draft']).default('public'),
  status: z.enum(['active', 'archived']).default('active'),
})

export type AssignmentInput = z.infer<typeof assignmentSchema>
