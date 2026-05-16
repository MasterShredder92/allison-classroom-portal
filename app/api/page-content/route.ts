import { type NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { pageContentSchema } from '@/lib/validations/page'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { rateLimit, readJson, requireAdmin } from '@/lib/api/request'

const createPageSchema = pageContentSchema.extend({
  slug: z.string()
    .min(2, 'Page URL required')
    .max(80, 'Page URL is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
})

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('page_content')
      .select('id, slug, title, body_markdown, updated_at')
      .order('title', { ascending: true })

    if (error) throw error
    return ok(data || [])
  } catch (error) {
    return serverFail(error, 'GET /api/page-content')
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const admin = await requireAdmin(request)
    if (admin.error) return admin.error

    const body = await readJson(request)
    if (!body) return fail('Invalid JSON body', 400)

    const parsed = createPageSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('page_content')
      .insert({ ...parsed, updated_at: new Date().toISOString() })
      .select('*')
      .single()

    if (error?.code === '23505') return fail('A page with that URL already exists.', 400)
    if (error) throw error
    return ok(data, 201)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'POST /api/page-content')
  }
}
