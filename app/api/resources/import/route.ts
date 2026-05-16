import { NextRequest } from 'next/server'
import { z } from 'zod'
import { created, serverFail, validationFail } from '@/lib/api/responses'
import { rateLimit, readJson, requireAdmin } from '@/lib/api/request'
import { buildEmbedUrl, detectKindFromUrl, normalizeTitle, sourceTypeFromUrl } from '@/lib/resources'

const schema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  url: z.string().trim().url(),
  resourceKind: z.string().optional().default('auto'),
  postedTarget: z.enum(['announcement', 'assignment', 'link', 'photo', 'schedule', 'page']).optional().nullable(),
})

function fallbackTitle(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('docs.google.com')) return 'Google Classroom Resource'
    if (parsed.hostname.includes('drive.google.com')) return 'Google Drive Resource'
    if (parsed.hostname.includes('calendar.google.com')) return 'Class Schedule Calendar'
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) return 'Class Video'
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return 'Classroom Resource'
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const { error, supabase, userId } = await requireAdmin(request)
    if (error) return error

    const body = await readJson(request)
    const parsed = schema.safeParse(body)
    if (!parsed.success) return validationFail(parsed.error)

    const resourceKind = detectKindFromUrl(parsed.data.url, parsed.data.resourceKind)
    const embedUrl = buildEmbedUrl(parsed.data.url, resourceKind)
    const title = normalizeTitle(parsed.data.title, fallbackTitle(parsed.data.url))

    const { data, error: insertError } = await supabase
      .from('resources')
      .insert({
        title,
        description: parsed.data.description || null,
        resource_kind: resourceKind,
        source_type: sourceTypeFromUrl(parsed.data.url),
        original_url: parsed.data.url,
        public_url: parsed.data.url,
        embed_url: embedUrl || null,
        posted_target: parsed.data.postedTarget || null,
        visibility: 'public',
        created_by: userId,
      })
      .select('*')
      .single()

    if (insertError) return serverFail(insertError, 'resources.import.insert')

    return created(data)
  } catch (error) {
    return serverFail(error, 'resources.import')
  }
}
