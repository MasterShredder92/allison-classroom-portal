import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { photoUpdateSchema } from '@/lib/validations/page'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { created, fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { getIdFromRequest, rateLimit, readJson, requireAdmin } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('photo_updates')
      .select('*')
      .eq('visibility', 'public')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return ok(data ?? [])
  } catch (error) {
    return serverFail(error, 'GET /api/photo-updates')
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

    const parsed = photoUpdateSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('photo_updates')
      .insert(parsed)
      .select('*')
      .single()

    if (error) throw error
    return created(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'POST /api/photo-updates')
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
    if (!id) return fail('Missing photo update id', 400)

    const parsed = photoUpdateSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('photo_updates')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error?.code === 'PGRST116') return fail('Photo update not found', 404)
    if (error) throw error
    return ok(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/photo-updates')
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
    if (!id) return fail('Missing photo update id', 400)

    const { data, error } = await admin.supabase
      .from('photo_updates')
      .delete()
      .eq('id', id)
      .select('id')
      .single()

    if (error?.code === 'PGRST116') return fail('Photo update not found', 404)
    if (error) throw error
    return ok({ id: data.id, deleted: true })
  } catch (error) {
    return serverFail(error, 'DELETE /api/photo-updates')
  }
}

