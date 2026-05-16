import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { scheduleSchema } from '@/lib/validations/page'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { getIdFromRequest, rateLimit, readJson, requireAdmin } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return ok(data)
  } catch (error) {
    return serverFail(error, 'GET /api/schedule')
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

    const parsed = scheduleSchema.parse(body)
    const id = getIdFromRequest(request, body)
    const payload = { ...parsed, updated_at: new Date().toISOString() }

    if (id) {
      const { data, error } = await admin.supabase
        .from('schedule')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()

      if (error?.code === 'PGRST116') return fail('Schedule not found', 404)
      if (error) throw error
      return ok(data)
    }

    const { data: current, error: currentError } = await admin.supabase
      .from('schedule')
      .select('id')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (currentError) throw currentError

    if (current?.id) {
      const { data, error } = await admin.supabase
        .from('schedule')
        .update(payload)
        .eq('id', current.id)
        .select('*')
        .single()

      if (error) throw error
      return ok(data)
    }

    const { data, error } = await admin.supabase
      .from('schedule')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return ok(data)
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/schedule')
  }
}

