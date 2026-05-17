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
    const definitionsByKey = new Map(siteSettingDefinitions.map(definition => [definition.key, definition]))
    const rows = Object.entries(parsed.settings).map(([key, value]) => {
      const definition = definitionsByKey.get(key as SiteSettingKey)
      return {
        key,
        label: definition?.label || key,
        description: definition?.description || '',
        group_name: definition?.group || 'Site Content',
        field_type: definition?.fieldType || 'text',
        value: value.trim(),
        sort_order: definition?.sortOrder || 999,
        updated_at: new Date().toISOString(),
      }
    })

    const { data, error } = await admin.supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' })
      .select('key, label, description, group_name, field_type, value, sort_order, updated_at')
      .order('sort_order', { ascending: true })

    if (error) throw error

    const merged = mergeSiteSettings(data || [])
    return ok(siteSettingsForRows(merged))
  } catch (error) {
    if (error instanceof ZodError) return validationFail(error)
    return serverFail(error, 'PUT /api/site-settings')
  }
}
