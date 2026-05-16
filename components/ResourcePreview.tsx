interface ResourcePreviewProps {
  url?: string
  title?: string
  compact?: boolean
}

type PreviewKind = 'image' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'video' | 'calendar' | 'website' | 'other'

function extractGoogleId(url: string, pattern: RegExp) {
  return url.match(pattern)?.[1] || null
}

function detectKind(url: string): PreviewKind {
  const lower = url.toLowerCase()
  if (lower.includes('calendar.google.com')) return 'calendar'
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'video'
  if (lower.includes('docs.google.com/spreadsheets')) return 'spreadsheet'
  if (lower.includes('docs.google.com/presentation')) return 'presentation'
  if (lower.includes('docs.google.com/document')) return 'document'
  if (lower.includes('drive.google.com/file')) return 'document'
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(lower)) return 'image'
  if (/\.pdf(\?|$)/i.test(lower)) return 'pdf'
  return 'website'
}

function buildPreviewUrl(url: string, kind: PreviewKind) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }
    if (parsed.hostname.includes('calendar.google.com')) {
      if (parsed.pathname.includes('/embed')) return parsed.toString()
      const cid = parsed.searchParams.get('src') || parsed.searchParams.get('cid')
      return cid ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(cid)}&ctz=America%2FChicago` : parsed.toString()
    }
  } catch {
    return ''
  }

  if (url.includes('docs.google.com/document/')) {
    const id = extractGoogleId(url, /\/document\/d\/([^/]+)/)
    return id ? `https://docs.google.com/document/d/${id}/preview` : ''
  }
  if (url.includes('docs.google.com/spreadsheets/')) {
    const id = extractGoogleId(url, /\/spreadsheets\/d\/([^/]+)/)
    return id ? `https://docs.google.com/spreadsheets/d/${id}/preview` : ''
  }
  if (url.includes('docs.google.com/presentation/')) {
    const id = extractGoogleId(url, /\/presentation\/d\/([^/]+)/)
    return id ? `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000` : ''
  }
  if (url.includes('drive.google.com/file/')) {
    const id = extractGoogleId(url, /\/file\/d\/([^/]+)/)
    return id ? `https://drive.google.com/file/d/${id}/preview` : ''
  }
  if (kind === 'image' || kind === 'pdf') return url
  return ''
}

function labelForKind(kind: PreviewKind) {
  const labels: Record<PreviewKind, string> = {
    image: 'Image',
    pdf: 'PDF',
    document: 'Document',
    spreadsheet: 'Sheet',
    presentation: 'Slides',
    video: 'Video',
    calendar: 'Calendar',
    website: 'Website',
    other: 'Resource',
  }
  return labels[kind]
}

export default function ResourcePreview({ url, title = 'Classroom resource', compact = false }: ResourcePreviewProps) {
  if (!url) return null

  const kind = detectKind(url)
  const previewUrl = buildPreviewUrl(url, kind)
  const canEmbed = Boolean(previewUrl) && kind !== 'website'

  return (
    <div className={`resource-preview ${compact ? 'resource-preview-compact' : ''}`}>
      <div className="resource-preview-bar">
        <span>{labelForKind(kind)}</span>
        <a href={url} target="_blank" rel="noopener noreferrer">Open full view ↗</a>
      </div>
      {kind === 'image' && previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={title} className="resource-preview-image" loading="lazy" />
      ) : canEmbed ? (
        <iframe
          title={title}
          src={previewUrl}
          className="resource-preview-frame"
          loading="lazy"
          allowFullScreen
        />
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="resource-preview-link">
          View this classroom resource
        </a>
      )}
    </div>
  )
}
