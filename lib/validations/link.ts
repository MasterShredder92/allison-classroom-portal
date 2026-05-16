import { z } from 'zod'

export const linkSchema = z.object({
  category: z.enum(['gradebook', 'school', 'classroom_tools', 'reading', 'curriculum', 'other']),
  title: z.string().min(1, 'Title required').max(200),
  url: z.string().url('Invalid URL'),
  description: z.string().max(500).optional().or(z.literal('')),
  audience: z.string().default('everyone'),
  sort_order: z.number().int().default(0),
  active: z.boolean().default(true),
})

export type LinkInput = z.infer<typeof linkSchema>
