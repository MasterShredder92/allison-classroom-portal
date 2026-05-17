import { type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { fail, ok, serverFail, validationFail } from '@/lib/api/responses'
import { rateLimit, readJson, requireAdmin } from '@/lib/api/request'
import { createPublicSupabaseClient } from '@/lib/supabase/server'
import { mergeSiteSettings, siteSettingDefinitions, siteSettingsForRows, siteSettingsUpdateSchema, type SiteSettingKey } from '@/lib/site-settings'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const supabase = createPublicSupabaseClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, label, description, group_name, field_type, value, sort_order, updated_at')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('GET /api/site-settings falling back to defaults:', error.message)
      return ok(siteSettingsForRows(mergeSiteSettings()))
    }

    const merged = mergeSiteSettings(data || [])
    return ok(siteSettingsForRows(merged))
  } catch (error) {
    console.error('GET /api/site-settings falling back to defaults:', error)
    return ok(siteSettingsForRows(mergeSiteSettings()))
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

    const parsed = siteSettingsUpdateSchema.parse(body)
    const now = new Date().toISOString()

    for (const definition of siteSettingDefinitions) {
      const value = parsed.settings[definition.key as SiteSettingKey]
      if (typeof value !== 'string') continue

      const { error } = await admin.supabase
        .from('site_settings')
        .update({ value: value.trim(), updated_at: now })
        .eq('key', definition.key)

      if (error) throw error
    }

    const { data, error: readError } = await admin.supabase
      .from('site_settings')
      .select('key, label, description, group_name, field_type, value, sort_order, updated_at')
      .order('sort_order', { ascending: true })

    if (readError) throw readError

    const merged = mergeSiteSettings(data || [])
    return ok(siteSettingsForRows(merged))
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/site-settings')
  }
}
