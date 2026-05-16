import { NextRequest } from 'next/server'
import { created, fail, serverFail } from '@/lib/api/responses'
import { rateLimit, requireAdmin } from '@/lib/api/request'
import { detectKindFromMime, makeStoragePath, normalizeTitle, RESOURCE_BUCKET } from '@/lib/resources'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
])

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'write')
  if (limited) return limited

  try {
    const { error, supabase, userId } = await requireAdmin(request)
    if (error) return error

    const formData = await request.formData()
    const file = formData.get('file')
    const title = normalizeTitle(formData.get('title'), file instanceof File ? file.name : 'Classroom Resource')
    const description = typeof formData.get('description') === 'string' ? String(formData.get('description')).trim() : null
    const postedTarget = typeof formData.get('postedTarget') === 'string' ? String(formData.get('postedTarget')) : null

    if (!(file instanceof File)) return fail('Missing file upload', 400)
    if (file.size > MAX_UPLOAD_BYTES) return fail('File is too large. Please upload a file under 10MB.', 400)
    if (!ALLOWED_MIME_TYPES.has(file.type)) return fail('File type is not supported yet.', 400)

    const storagePath = makeStoragePath(file.name, file.type)
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(RESOURCE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) return serverFail(uploadError, 'resources.upload.storage')

    const { data: publicData } = supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(storagePath)
    const publicUrl = publicData.publicUrl
    const resourceKind = detectKindFromMime(file.type, file.name)

    const { data, error: insertError } = await supabase
      .from('resources')
      .insert({
        title,
        description,
        resource_kind: resourceKind,
        source_type: 'upload',
        public_url: publicUrl,
        embed_url: resourceKind === 'image' || resourceKind === 'pdf' ? publicUrl : null,
        storage_bucket: RESOURCE_BUCKET,
        storage_path: storagePath,
        mime_type: file.type,
        file_size_bytes: file.size,
        posted_target: postedTarget,
        visibility: 'public',
        created_by: userId,
      })
      .select('*')
      .single()

    if (insertError) return serverFail(insertError, 'resources.upload.insert')

    return created(data)
  } catch (error) {
    return serverFail(error, 'resources.upload')
  }
}
