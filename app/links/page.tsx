'use client'

import { useEffect, useState } from 'react'
import LinkCard from '@/components/LinkCard'

interface Link {
  id: string
  category: string
  title: string
  url: string
  description?: string
  audience?: string
}

const categoryLabels: Record<string, string> = {
  gradebook: '📊 Gradebook',
  school: '🏫 School Site',
  classroom_tools: '🎯 Classroom Tools',
  reading: '📚 Reading',
  curriculum: '📖 Curriculum',
  other: '🔗 Other Resources',
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch('/api/links')
        if (res.ok) {
          const data = await res.json()
          setLinks(data.data)
        }
      } catch (error) {
        console.error('Error fetching links:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLinks()
  }, [])

  const groupedLinks = links.reduce(
    (acc, link) => {
      if (!acc[link.category]) acc[link.category] = []
      acc[link.category].push(link)
      return acc
    },
    {} as Record<string, Link[]>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">Helpful Links</h1>

      {loading ? (
        <div className="space-y-12">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-8 bg-neutral-light-gray rounded mb-4 animate-pulse w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-32 bg-neutral-light-gray rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedLinks).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
            <div key={category}>
              <h2 className="font-serif text-2xl font-semibold text-neutral-text mb-6">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryLinks.map(link => (
                  <LinkCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-dark-gray text-lg">No links available yet.</p>
        </div>
      )}
    </div>
  )
}
