import { z } from 'zod'

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  body: z.string().min(1, 'Content required'),
  date: z.string().date(),
  pinned: z.boolean().default(false),
  visibility: z.enum(['public', 'link_only', 'draft']).default('public'),
  attachment_url: z.string().url().optional().or(z.literal('')),
  link_url: z.string().url().optional().or(z.literal('')),
})

export type AnnouncementInput = z.infer<typeof announcementSchema>
