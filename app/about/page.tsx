'use client'

import { useEffect, useState } from 'react'

interface PageContent {
  slug: string
  title: string
  body_markdown: string
}

export default function AboutPage() {
  const [content, setContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/page-content/about')
        if (res.ok) {
          const data = await res.json()
          setContent(data.data)
        }
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-10 bg-neutral-light-gray rounded mb-8 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-neutral-light-gray rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {content ? (
        <>
          <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">
            {content.title}
          </h1>
          <div className="prose prose-sm max-w-none text-neutral-text">
            <div dangerouslySetInnerHTML={{ __html: content.body_markdown }} />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-dark-gray">Content not available yet.</p>
        </div>
      )}
    </div>
  )
}
