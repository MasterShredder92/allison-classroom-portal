"use client"
import { useEffect, useState } from 'react'
import LinkCard from '@/components/LinkCard'

interface LinkItem {
  id: string
  category: string
  title: string
  url: string
  description?: string
  audience?: string
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([])
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

  const groupedLinks = links.reduce((acc, link) => {
    const category = link.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(link)
    return acc
  }, {} as Record<string, LinkItem[]>)

  const categoryLabels: Record<string, string> = {
    gradebook: 'Gradebook',
    school: 'School Resources',
    classroom_tools: 'Classroom Tools',
    reading: 'Reading',
    curriculum: 'Curriculum',
    other: 'Other Helpful Links',
  }

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Resource Shelf</span>
          <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">Parent links</h1>
          <p className="mt-4 text-lg leading-8 text-neutral-dark-gray">The important classroom, school, gradebook, and curriculum links in one organized place.</p>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 animate-pulse rounded-[1.5rem] bg-white/80" />)}</div>
        ) : links.length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
              <div key={category}>
                <h2 className="mb-4 font-serif text-3xl font-black text-neutral-text">{categoryLabels[category] || category}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{categoryLinks.map(link => <LinkCard key={link.id} link={link} />)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state rounded-[2rem] p-10 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-cyan/20 text-3xl">🔗</div>
            <h2 className="font-serif text-3xl font-black text-neutral-text">No links posted yet</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-dark-gray">Add classroom tools and family resources from the admin dashboard.</p>
          </div>
        )}
      </section>
    </div>
  )
}

