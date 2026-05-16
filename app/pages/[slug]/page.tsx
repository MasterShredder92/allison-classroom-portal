"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import RichContent from '@/components/RichContent'

interface PageContent {
  slug: string
  title: string
  body_markdown?: string
}

export default function CustomPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    fetch(`/api/page-content/${slug}`)
      .then(async res => {
        if (!res.ok) return null
        const payload = await res.json()
        return payload.data as PageContent
      })
      .then(setPage)
      .catch(error => console.error('Error loading custom page:', error))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="classroom-shell py-10 sm:py-14">
        <div className="h-72 animate-pulse rounded-[2rem] bg-white/80" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="classroom-shell py-10 sm:py-14">
        <section className="empty-state rounded-[2rem] p-10 text-center">
          <h1 className="font-serif text-4xl font-black text-neutral-text">Page not found</h1>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-dark-gray">This page may have been removed by the teacher.</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-accent-cyan px-5 py-3 font-black text-white hover:opacity-90">Back to Home</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card notebook-lines rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Classroom Page</span>
          <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">{page.title}</h1>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-neutral-medium-gray/70 bg-white p-8 shadow-sm sm:p-10">
        <RichContent html={page.body_markdown} />
      </section>
    </div>
  )
}
