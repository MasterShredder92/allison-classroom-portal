"use client"

import { useMemo } from 'react'

interface RichContentProps {
  html?: string | null
  className?: string
}

function sanitizeHtml(html: string) {
  if (typeof window === 'undefined') return html

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  doc.querySelectorAll('script, iframe, object, embed, form, input, button').forEach(node => node.remove())
  doc.querySelectorAll('*').forEach(node => {
    Array.from(node.attributes).forEach(attribute => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.toLowerCase()
      if (name.startsWith('on') || value.includes('javascript:')) node.removeAttribute(attribute.name)
    })
  })

  return doc.body.innerHTML
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
  const safeHtml = useMemo(() => sanitizeHtml(markdownFallbackToHtml(html || '')), [html])

  if (!safeHtml) return null

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
