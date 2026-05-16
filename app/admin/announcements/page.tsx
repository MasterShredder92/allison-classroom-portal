'use client'

import { useEffect, useState } from 'react'
import AdminQuickResourcePost from '@/components/AdminQuickResourcePost'

interface Announcement {
  id: string
  title: string
  body: string
  date: string
  pinned?: boolean
  attachment_url?: string
  link_url?: string
}

async function getApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    link_url: '',
    attachment_url: '',
    pinned: false,
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    try {
      const res = await fetch('/api/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.data.sort((a: Announcement, b: Announcement) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingId ? 'PUT' : 'POST'
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/announcements', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          ...formData,
          date: new Date().toISOString().split('T')[0],
        }),
      })

      if (!response.ok) {
        setError(await getApiError(response, 'Announcement could not be saved. Check the fields and try again.'))
        return
      }

      setFormData({ title: '', body: '', link_url: '', attachment_url: '', pinned: false })
      setEditingId(null)
      setShowForm(false)
      fetchAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
      setError('Announcement could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return

    try {
      const response = await fetch('/api/announcements', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        setError(await getApiError(response, 'Announcement could not be deleted.'))
        return
      }

      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      setError('Announcement could not be deleted. Check your connection and try again.')
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      body: announcement.body,
      link_url: announcement.link_url || '',
      attachment_url: announcement.attachment_url || '',
      pinned: announcement.pinned || false,
    })
    setEditingId(announcement.id)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-text">Announcements</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', body: '', link_url: '', attachment_url: '', pinned: false })
          }}
          className="bg-accent-pink text-white px-4 py-2 rounded font-semibold hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'New Announcement'}
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
          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-text">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="admin-input"
              placeholder="Announcement title"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-text">Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="admin-textarea h-40"
              placeholder="What's new in the classroom?"
              dir="ltr"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-text">Link URL (optional)</label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="admin-input"
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-text">Attachment URL (optional)</label>
              <input
                type="url"
                value={formData.attachment_url}
                onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                className="admin-input"
                placeholder="https://example.com/file.pdf"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="pinned" className="ml-2 text-sm font-semibold text-neutral-text cursor-pointer">
              Pin to top
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-accent-cyan text-white px-6 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Publish'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ title: '', body: '', link_url: '', attachment_url: '', pinned: false })
                  setShowForm(false)
                }}
                className="bg-neutral-medium-gray text-neutral-text px-6 py-2 rounded font-semibold hover:opacity-90"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="admin-doc-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-serif text-lg font-semibold text-neutral-text">{announcement.title}</h3>
                    {announcement.pinned && (
                      <span className="bg-accent-pink text-white text-xs font-bold px-2 py-1 rounded">Pinned</span>
                    )}
                  </div>
                  <p className="text-neutral-dark-gray text-sm mb-2">
                    {new Date(announcement.date).toLocaleDateString()}
                  </p>
                  <p className="text-neutral-text text-sm line-clamp-2">{announcement.body}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(announcement)}
                  className="text-accent-cyan hover:underline text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="text-accent-pink hover:underline text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
          <p className="text-neutral-dark-gray">No announcements yet.</p>
        </div>
      )}
    </div>
  )
}
