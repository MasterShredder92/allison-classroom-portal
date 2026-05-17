import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function requiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }

  return value
}

function optionalEnv(name: string) {
  const value = process.env[name]
  return value || null
}

function decodeJwtRole(token: string | null) {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { role?: unknown }
    return typeof decoded.role === 'string' ? decoded.role : null
  } catch {
    return null
  }
}

function getSupabaseUrl() {
  return requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
}

function createServerClient(key: string, accessToken?: string) {
  return createSupabaseClient(getSupabaseUrl(), key, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function createPublicSupabaseClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createServerClient(key)
}

export function createServiceSupabaseClient() {
  return createServerClient(requiredEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

export function createUserSupabaseClient(accessToken: string) {
  const key = optionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createServerClient(key, accessToken)
}

export function getConfiguredSupabaseServiceRole() {
  return decodeJwtRole(optionalEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

export function hasConfiguredSupabaseServiceRole() {
  return getConfiguredSupabaseServiceRole() === 'service_role'
}
