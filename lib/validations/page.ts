import { z } from 'zod'

export const pageContentSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  body_markdown: z.string().optional().or(z.literal('')),
})

export type PageContentInput = z.infer<typeof pageContentSchema>

export const scheduleSchema = z.object({
  title: z.string().max(200).optional(),
  image_url: z.string().max(2000, 'Schedule link is too long').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  active: z.boolean().default(true),
})

export type ScheduleInput = z.infer<typeof scheduleSchema>

export const photoUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  image_url: z.string().url('Invalid image URL'),
  date: z.string().date().default(new Date().toISOString().split('T')[0]),
  visibility: z.enum(['public', 'draft']).default('draft'),
})

export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>
