import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { pageContentSchema } from '@/lib/validations/page'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { rateLimit, readJson, requireAdmin } from '@/lib/api/request'

type RouteContext = {
  params: Promise<{ slug: string }>
}

function isProtectedPage(slug: string) {
  return ['about', 'contact'].includes(slug)
}

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const { slug } = await context.params
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error?.code === 'PGRST116') return fail('Page content not found', 404)
    if (error) throw error
    return ok(data)
  } catch (error) {
    return serverFail(error, 'GET /api/page-content/[slug]')
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const admin = await requireAdmin(request)
    if (admin.error) return admin.error

    const { slug } = await context.params
    const body = await readJson(request)
    if (!body) return fail('Invalid JSON body', 400)

    const parsed = pageContentSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('page_content')
      .upsert({ slug, ...parsed, updated_at: new Date().toISOString() }, { onConflict: 'slug' })
      .select('*')
      .single()

    if (error) throw error
    return ok(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/page-content/[slug]')
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const admin = await requireAdmin(request)
    if (admin.error) return admin.error

    const { slug } = await context.params
    if (isProtectedPage(slug)) return fail('About and Contact are required site pages and cannot be deleted.', 400)

    const { data, error } = await admin.supabase
      .from('page_content')
      .delete()
      .eq('slug', slug)
      .select('*')
      .single()

    if (error?.code === 'PGRST116') return fail('Page content not found', 404)
    if (error) throw error
    return ok(data)
  } catch (error) {
    return serverFail(error, 'DELETE /api/page-content/[slug]')
  }
}
