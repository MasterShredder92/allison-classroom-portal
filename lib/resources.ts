import { randomUUID } from 'crypto'

export const RESOURCE_BUCKET = 'classroom-resources'

export type ResourceKind = 'image' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'video' | 'website' | 'calendar' | 'other'
export type SourceType = 'upload' | 'google_url' | 'external_url'
export type PostTarget = 'announcement' | 'assignment' | 'link' | 'photo' | 'schedule' | 'page'

const extensionByMime: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
}

export function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'classroom-resource'
}

export function makeStoragePath(fileName: string, mimeType: string) {
  const ext = extensionByMime[mimeType] || fileName.split('.').pop()?.toLowerCase() || 'file'
  const date = new Date().toISOString().slice(0, 10)
  return `${date}/${slugifyFileName(fileName)}-${randomUUID()}.${ext}`
}

export function detectKindFromMime(mimeType = '', fallbackName = ''): ResourceKind {
  const name = fallbackName.toLowerCase()
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (mimeType.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'document'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || name.endsWith('.xls') || name.endsWith('.xlsx')) return 'spreadsheet'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'presentation'
  return 'other'
}

export function detectKindFromUrl(url: string, selected?: string): ResourceKind {
  if (selected && selected !== 'auto') return selected as ResourceKind
  const lower = url.toLowerCase()
  if (lower.includes('calendar.google.com')) return 'calendar'
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'video'
  if (lower.includes('/spreadsheets/') || lower.includes('docs.google.com/spreadsheets')) return 'spreadsheet'
  if (lower.includes('/presentation/') || lower.includes('docs.google.com/presentation')) return 'presentation'
  if (lower.includes('/document/') || lower.includes('docs.google.com/document')) return 'document'
  if (lower.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/)) return 'image'
  if (lower.match(/\.pdf(\?|$)/)) return 'pdf'
  return 'website'
}

export function sourceTypeFromUrl(url: string): SourceType {
  return url.includes('docs.google.com') || url.includes('drive.google.com') || url.includes('calendar.google.com') ? 'google_url' : 'external_url'
}

function extractGoogleId(url: string, pattern: RegExp) {
  const match = url.match(pattern)
  return match?.[1] || null
}

export function buildEmbedUrl(url: string, kind: ResourceKind) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    if (parsed.hostname.includes('calendar.google.com')) {
      if (parsed.pathname.includes('/embed')) return url
      const cid = parsed.searchParams.get('src') || parsed.searchParams.get('cid')
      return cid ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(cid)}&ctz=America%2FChicago` : url
    }
  } catch {
    return undefined
  }

  if (url.includes('docs.google.com/document/')) {
    const id = extractGoogleId(url, /\/document\/d\/([^/]+)/)
    return id ? `https://docs.google.com/document/d/${id}/preview` : url
  }
  if (url.includes('docs.google.com/spreadsheets/')) {
    const id = extractGoogleId(url, /\/spreadsheets\/d\/([^/]+)/)
    return id ? `https://docs.google.com/spreadsheets/d/${id}/preview` : url
  }
  if (url.includes('docs.google.com/presentation/')) {
    const id = extractGoogleId(url, /\/presentation\/d\/([^/]+)/)
    return id ? `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000` : url
  }
  if (url.includes('drive.google.com/file/')) {
    const id = extractGoogleId(url, /\/file\/d\/([^/]+)/)
    return id ? `https://drive.google.com/file/d/${id}/preview` : url
  }
  if (kind === 'image' || kind === 'pdf') return url
  return undefined
}

export function normalizeTitle(input: unknown, fallback: string) {
  return typeof input === 'string' && input.trim() ? input.trim().slice(0, 200) : fallback
}
