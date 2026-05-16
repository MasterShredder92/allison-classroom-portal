import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { linkSchema } from '@/lib/validations/link'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { created, fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { getIdFromRequest, rateLimit, readJson, requireAdmin } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })

    if (error) throw error
    return ok(data ?? [])
  } catch (error) {
    return serverFail(error, 'GET /api/links')
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

    const parsed = linkSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('links')
      .insert(parsed)
      .select('*')
      .single()

    if (error) throw error
    return created(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'POST /api/links')
  }
}

export async function PUT(request: NextRequest) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const admin = await requireAdmin(request)
    if (admin.error) return admin.error

    const body = await readJson(request)
    if (!body) return fail('Invalid JSON body', 400)

    const id = getIdFromRequest(request, body)
    if (!id) return fail('Missing link id', 400)

    const parsed = linkSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('links')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error?.code === 'PGRST116') return fail('Link not found', 404)
    if (error) throw error
    return ok(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/links')
  }
}

export async function DELETE(request: NextRequest) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const admin = await requireAdmin(request)
    if (admin.error) return admin.error

    const body = await readJson(request)
    const id = getIdFromRequest(request, body)
    if (!id) return fail('Missing link id', 400)

    const { data, error } = await admin.supabase
      .from('links')
      .delete()
      .eq('id', id)
      .select('id')
      .single()

    if (error?.code === 'PGRST116') return fail('Link not found', 404)
    if (error) throw error
    return ok({ id: data.id, deleted: true })
  } catch (error) {
    return serverFail(error, 'DELETE /api/links')
  }
}

