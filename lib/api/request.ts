import type { NextRequest } from 'next/server'
import { fail } from '@/lib/api/responses'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

const TEMP_ADMIN_EMAIL = 'admin@allison-classroom.test'

const WINDOW_MS = 60_000
const READ_LIMIT = 120
const WRITE_LIMIT = 30
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(request: NextRequest, scope: 'read' | 'write') {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  const key = `${scope}:${ip}`
  const limit = scope === 'read' ? READ_LIMIT : WRITE_LIMIT
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return null
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return fail('Too many requests', 429)
  }

  return null
}

export function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length).trim()
}

export async function requireAdmin(request: NextRequest) {
  const accessToken = getBearerToken(request)

  if (!accessToken) {
    return { error: fail('Missing bearer token', 401), supabase: null, userId: null }
  }

  const supabase = createServiceSupabaseClient()
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken)

  if (authError || !authData.user) {
    return { error: fail('Invalid bearer token', 401), supabase: null, userId: null }
  }
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', authData.user.id)
    .single()

  const isApprovedTempAdmin = authData.user.email?.toLowerCase() === TEMP_ADMIN_EMAIL

  if ((profileError || !profile) && !isApprovedTempAdmin) {
    return { error: fail('Admin profile not found', 403), supabase: null, userId: null }
  }

  if (profile?.role !== 'admin' && !isApprovedTempAdmin) {
    return { error: fail('Admin access required', 403), supabase: null, userId: null }
  }

  return { error: null, supabase, userId: authData.user.id }
}

export async function readJson(request: NextRequest) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export function getIdFromRequest(request: NextRequest, body: unknown) {
  const urlId = request.nextUrl.searchParams.get('id')

  if (urlId) {
    return urlId
  }

  if (body && typeof body === 'object' && 'id' in body) {
    const value = (body as { id?: unknown }).id
    return typeof value === 'string' ? value : null
  }

  return null
}
