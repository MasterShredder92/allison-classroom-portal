import { type NextRequest } from 'next/server'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { ok, serverFail } from '@/lib/api/responses'
import { rateLimit } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return ok(data ?? [])
  } catch (error) {
    return serverFail(error, 'GET /api/classes')
  }
}

