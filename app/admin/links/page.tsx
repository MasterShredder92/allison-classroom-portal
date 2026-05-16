'use client'

import { useEffect, useState } from 'react'
import AdminQuickResourcePost from '@/components/AdminQuickResourcePost'

interface Link {
  id: string
  category: string
  title: string
  url: string
  description?: string
}

async function getApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

const categories = ['gradebook', 'school', 'classroom_tools', 'reading', 'curriculum', 'other']

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category: 'other',
    title: '',
    url: '',
    description: '',
  })

  const refreshLinks = async () => {
    const res = await fetch('/api/links')
    if (!res.ok) {
      setError(await getApiError(res, 'Could not load links.'))
      return
    }
    const data = await res.json()
    setLinks(data.data)
  }

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
    const method = editingId ? 'PUT' : 'POST'
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/links', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ ...(editingId && { id: editingId }), ...formData, active: true, sort_order: links.length + 1 }),
      })
      if (!response.ok) {
        setError(await getApiError(response, 'Link could not be saved. Check the fields and try again.'))
        return
      }

      await refreshLinks()
      setFormData({ category: 'other', title: '', url: '', description: '' })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving link:', error)
      setError('Link could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return
    setError(null)
    try {
      const response = await fetch('/api/links', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        setError(await getApiError(response, 'Link could not be deleted.'))
        return
      }

      await refreshLinks()
    } catch (error) {
      console.error('Error deleting link:', error)
      setError('Link could not be deleted. Check your connection and try again.')
    }
  }

  const handleEdit = (link: Link) => {
    setError(null)
    setFormData({
      category: link.category,
      title: link.title,
      url: link.url,
      description: link.description || '',
    })
    setEditingId(link.id)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-text">Links</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setError(null)
            setFormData({ category: 'other', title: '', url: '', description: '' })
          }}
          className="bg-accent-sky-blue text-white px-4 py-2 rounded font-semibold hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'New Link'}
        </button>
      </div>

      <div className="mb-8">
        <AdminQuickResourcePost compact />
      </div>
      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-doc-card mb-8 space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-text">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="admin-input"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-text">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="admin-input"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-text">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="admin-input"
                dir="ltr"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-text">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="admin-input"
              dir="ltr"
            />
          </div>

          <button type="submit" className="bg-accent-sky-blue text-white px-6 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-60" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Link' : 'Add Link'}
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
            <div key={link.id} className="admin-doc-card flex items-start justify-between p-4">
              <div className="flex-1">
                <p className="font-semibold text-neutral-text">{link.title}</p>
                <p className="text-xs text-neutral-dark-gray">{link.category}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(link)} className="text-accent-cyan text-sm font-semibold" disabled={saving}>
                  Edit
                </button>
                <button onClick={() => handleDelete(link.id)} className="text-accent-pink text-sm font-semibold" disabled={saving}>
                  Delete
                </button>
              </div>
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
