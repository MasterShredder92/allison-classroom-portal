import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { announcementSchema } from '@/lib/validations/announcement'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { created, fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { getIdFromRequest, rateLimit, readJson, requireAdmin } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .in('visibility', ['public', 'link_only'])
      .order('pinned', { ascending: false })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return ok(data ?? [])
  } catch (error) {
    return serverFail(error, 'GET /api/announcements')
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

    const parsed = announcementSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('announcements')
      .insert(parsed)
      .select('*')
      .single()

    if (error) throw error
    return created(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'POST /api/announcements')
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
    if (!id) return fail('Missing announcement id', 400)

    const parsed = announcementSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('announcements')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error?.code === 'PGRST116') return fail('Announcement not found', 404)
    if (error) throw error
    return ok(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/announcements')
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
    if (!id) return fail('Missing announcement id', 400)

    const { data, error } = await admin.supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .select('id')
      .single()

    if (error?.code === 'PGRST116') return fail('Announcement not found', 404)
    if (error) throw error
    return ok({ id: data.id, deleted: true })
  } catch (error) {
    return serverFail(error, 'DELETE /api/announcements')
  }
}

