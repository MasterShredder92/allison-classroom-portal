import { NextRequest } from 'next/server'
import { z } from 'zod'
import { created, fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { rateLimit, readJson, requireAdmin } from '@/lib/api/request'

const schema = z.object({
  targetType: z.enum(['announcement', 'assignment', 'link', 'photo', 'schedule', 'page']),
  targetId: z.string().uuid().optional().nullable(),
  active: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const { id } = await params
    if (!id) return fail('Missing resource id', 400)

    const { error, supabase } = await requireAdmin(request)
    if (error) return error

    const body = await readJson(request)
    const parsed = schema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)

    const { data, error: insertError } = await supabase
      .from('resource_posts')
      .insert({
        resource_id: id,
        target_type: parsed.data.targetType,
        target_id: parsed.data.targetId || null,
        active: parsed.data.active,
      })
      .select('*')
      .single()

    if (insertError) return serverFail(insertError, 'resource-posts.create')
    return created(data)
  } catch (error) {
    return serverFail(error, 'resource-posts.create')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const { id } = await params
    const { error, supabase } = await requireAdmin(request)
    if (error) return error

    const body = await readJson(request)
    const postId = typeof body === 'object' && body && 'postId' in body ? String(body.postId) : ''
    const active = typeof body === 'object' && body && 'active' in body ? Boolean(body.active) : false

    if (!id || !postId) return fail('Missing resource post id', 400)

    const { data, error: updateError } = await supabase
      .from('resource_posts')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('resource_id', id)
      .select('*')
      .single()

    if (updateError) return serverFail(updateError, 'resource-posts.update')
    return ok(data)
  } catch (error) {
    return serverFail(error, 'resource-posts.update')
  }
}
