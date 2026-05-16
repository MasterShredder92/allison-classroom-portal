"use client"

import { useEffect, useState } from 'react'
import RichContent from '@/components/RichContent'

interface PageContent {
  title: string
  body_markdown?: string
}

export default function ContactPage() {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/page-content/contact')
      .then(async res => {
        if (!res.ok) return null
        const payload = await res.json()
        return payload.data as PageContent
      })
      .then(setPage)
      .catch(error => console.error('Error loading Contact page:', error))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Contact</span>
          <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">
            {page?.title || 'Need to reach Allison?'}
          </h1>
          <p className="mt-4 text-lg leading-8 text-neutral-dark-gray">
            Contact details, classroom communication notes, and family instructions.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-neutral-medium-gray/70 bg-white p-8 shadow-sm sm:p-10">
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-light-gray" />
            <div className="h-32 animate-pulse rounded bg-neutral-light-gray" />
          </div>
        ) : page?.body_markdown ? (
          <RichContent html={page.body_markdown} />
        ) : (
          <p className="leading-7 text-neutral-dark-gray">This page is ready for Allison to edit in the Teacher Dashboard.</p>
        )}
      </section>
    </div>
  )
}
