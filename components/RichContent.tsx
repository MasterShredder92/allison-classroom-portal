interface RichContentProps {
  html?: string | null
  className?: string
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<\/?(script|iframe|object|embed|form|input|button)[^>]*>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

function markdownFallbackToHtml(content: string) {
  if (/<[a-z][\s\S]*>/i.test(content)) return content

  return content
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      if (block.startsWith('# ')) return `<h1>${block.slice(2)}</h1>`
      if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`
      if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`
      return `<p>${block.replace(/\n/g, '<br />')}</p>`
    })
    .join('')
}

export default function RichContent({ html, className = '' }: RichContentProps) {
  const safeHtml = sanitizeHtml(markdownFallbackToHtml(html || ''))

  if (!safeHtml) return null

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
