'use client'

import { useEffect, useState } from 'react'

interface PageContent {
  slug: string
  title: string
  body_markdown: string
}

const PAGES = ['about', 'contact']

export default function PagesPage() {
  const [currentPage, setCurrentPage] = useState('about')
  const [content, setContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body_markdown: '',
  })

  useEffect(() => {
    setLoading(true)
    fetch(`/api/page-content/${currentPage}`).then(async res => {
      if (res.ok) {
        const data = await res.json()
        setContent(data.data)
        setFormData({
          title: data.data.title,
          body_markdown: data.data.body_markdown,
        })
      }
      setLoading(false)
    })
  }, [currentPage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/page-content/${currentPage}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const res = await fetch(`/api/page-content/${currentPage}`)
        if (res.ok) {
          const data = await res.json()
          setContent(data.data)
        }
      }
    } catch (error) {
      console.error('Error saving page:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">Static Pages</h1>

      <div className="flex gap-2 mb-8">
        {PAGES.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              currentPage === page
                ? 'bg-accent-cyan text-white'
                : 'bg-neutral-light-gray text-neutral-text hover:bg-neutral-medium-gray'
            }`}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 bg-neutral-light-gray rounded animate-pulse" />
          <div className="h-96 bg-neutral-light-gray rounded animate-pulse" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-medium-gray space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">Content (HTML or Markdown)</label>
            <textarea
              value={formData.body_markdown}
              onChange={(e) => setFormData({ ...formData, body_markdown: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan h-96 font-mono text-sm"
              placeholder="<h2>Example</h2><p>Your content here</p>"
            />
            <p className="text-xs text-neutral-dark-gray mt-2">Use HTML or basic Markdown</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-accent-cyan text-white px-6 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </form>
      )}
    </div>
  )
}
