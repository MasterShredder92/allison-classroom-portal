'use client'

import { useEffect, useState } from 'react'

interface Link {
  id: string
  category: string
  title: string
  url: string
  description?: string
}

const categories = ['gradebook', 'school', 'classroom_tools', 'reading', 'curriculum', 'other']

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: 'other',
    title: '',
    url: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/links').then(async res => {
      if (res.ok) {
        const data = await res.json()
        setLinks(data.data)
      }
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, active: true, sort_order: links.length + 1 }),
      })
      if (response.ok) {
        const res = await fetch('/api/links')
        if (res.ok) {
          const data = await res.json()
          setLinks(data.data)
        }
        setFormData({ category: 'other', title: '', url: '', description: '' })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error saving link:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return
    try {
      const response = await fetch('/api/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (response.ok) {
        const res = await fetch('/api/links')
        if (res.ok) {
          const data = await res.json()
          setLinks(data.data)
        }
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-text">Links</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent-sky-blue text-white px-4 py-2 rounded font-semibold hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'New Link'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-medium-gray mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>

          <button type="submit" className="bg-accent-sky-blue text-white px-6 py-2 rounded font-semibold hover:opacity-90">
            Add Link
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      ) : links.length > 0 ? (
        <div className="space-y-2">
          {links.map(link => (
            <div key={link.id} className="bg-white p-4 rounded border border-neutral-medium-gray flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-neutral-text">{link.title}</p>
                <p className="text-xs text-neutral-dark-gray">{link.category}</p>
              </div>
              <button onClick={() => handleDelete(link.id)} className="text-accent-pink text-sm font-semibold">
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
          <p className="text-neutral-dark-gray">No links yet.</p>
        </div>
      )}
    </div>
  )
}
