import { NextRequest } from 'next/server'
import { fail, ok, serverFail } from '@/lib/api/responses'
import { rateLimit, readJson, requireAdmin } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const { searchParams } = request.nextUrl
    const kind = searchParams.get('kind')
    const target = searchParams.get('target')

    const { error, supabase } = await requireAdmin(request)
    if (error) return error

    let query = supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (kind) query = query.eq('resource_kind', kind)
    if (target) query = query.eq('posted_target', target)

    const { data, error: queryError } = await query
    if (queryError) return serverFail(queryError, 'resources.list')

    return ok(data ?? [])
  } catch (error) {
    return serverFail(error, 'resources.list')
  }
}

export async function PATCH(request: NextRequest) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const { error, supabase } = await requireAdmin(request)
    if (error) return error

    const body = await readJson(request)
    const id = typeof body === 'object' && body && 'id' in body ? String(body.id) : ''
    const visibility = typeof body === 'object' && body && 'visibility' in body ? String(body.visibility) : ''

    if (!id) return fail('Missing resource id', 400)
    if (!['public', 'draft', 'archived'].includes(visibility)) return fail('Invalid visibility', 400)

    const { data, error: updateError } = await supabase
      .from('resources')
      .update({ visibility, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) return serverFail(updateError, 'resources.archive')
    return ok(data)
  } catch (error) {
    return serverFail(error, 'resources.archive')
  }
}
