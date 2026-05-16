import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { assignmentSchema } from '@/lib/validations/assignment'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { created, fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { getIdFromRequest, rateLimit, readJson, requireAdmin } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const classId = request.nextUrl.searchParams.get('class_id')
    const supabase = createPublicSupabaseClient()
    let query = supabase
      .from('assignments')
      .select('*, classes(id, grade, subject, display_name, slug)')
      .eq('status', 'active')
      .in('visibility', ['public', 'link_only'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data, error } = await query
    if (error) throw error
    return ok(data ?? [])
  } catch (error) {
    return serverFail(error, 'GET /api/assignments')
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

    const parsed = assignmentSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('assignments')
      .insert(parsed)
      .select('*')
      .single()

    if (error) throw error
    return created(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'POST /api/assignments')
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
    if (!id) return fail('Missing assignment id', 400)

    const parsed = assignmentSchema.parse(body)
    const { data, error } = await admin.supabase
      .from('assignments')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error?.code === 'PGRST116') return fail('Assignment not found', 404)
    if (error) throw error
    return ok(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/assignments')
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
    if (!id) return fail('Missing assignment id', 400)

    const { data, error } = await admin.supabase
      .from('assignments')
      .delete()
      .eq('id', id)
      .select('id')
      .single()

    if (error?.code === 'PGRST116') return fail('Assignment not found', 404)
    if (error) throw error
    return ok({ id: data.id, deleted: true })
  } catch (error) {
    return serverFail(error, 'DELETE /api/assignments')
  }
}

