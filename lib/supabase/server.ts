import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function requiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }

  return value
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
  return createServerClient(requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'), accessToken)
}
