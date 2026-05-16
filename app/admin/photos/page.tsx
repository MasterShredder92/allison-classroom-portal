'use client'

import { useEffect, useState } from 'react'

interface Photo {
  id: string
  title?: string
  caption?: string
  image_url: string
  date: string
}

async function getApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    image_url: '',
  })

  const refreshPhotos = async () => {
    const res = await fetch('/api/photo-updates')
    if (!res.ok) {
      setError(await getApiError(res, 'Could not load photos.'))
      return
    }
    const data = await res.json()
    setPhotos(data.data)
  }

  useEffect(() => {
    fetch('/api/photo-updates').then(async res => {
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.data)
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
      const response = await fetch('/api/photo-updates', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          ...formData,
          date: new Date().toISOString().split('T')[0],
          visibility: 'public',
        }),
      })
      if (!response.ok) {
        setError(await getApiError(response, 'Photo update could not be saved. Check the fields and try again.'))
        return
      }

      await refreshPhotos()
      setFormData({ title: '', caption: '', image_url: '' })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving photo:', error)
      setError('Photo update could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo?')) return
    setError(null)
    try {
      const response = await fetch('/api/photo-updates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        setError(await getApiError(response, 'Photo update could not be deleted.'))
        return
      }

      await refreshPhotos()
    } catch (error) {
      console.error('Error deleting photo:', error)
      setError('Photo update could not be deleted. Check your connection and try again.')
    }
  }

  const handleEdit = (photo: Photo) => {
    setError(null)
    setFormData({
      title: photo.title || '',
      caption: photo.caption || '',
      image_url: photo.image_url || '',
    })
    setEditingId(photo.id)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-text">Classroom Photos</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setError(null)
            setFormData({ title: '', caption: '', image_url: '' })
          }}
          className="bg-accent-lavender text-white px-4 py-2 rounded font-semibold hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'New Photo'}
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-medium-gray mb-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">Caption</label>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan h-20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              placeholder="https://example.com/photo.jpg"
              required
            />
            <p className="text-xs text-neutral-dark-gray mt-1">Use Google Drive or Imgur for hosting</p>
          </div>

          <button type="submit" className="bg-accent-lavender text-white px-6 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-60" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Photo' : 'Upload Photo'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-lg border border-neutral-medium-gray overflow-hidden">
              <div className="aspect-square bg-neutral-light-gray"></div>
              <div className="p-4">
                <p className="text-sm text-neutral-dark-gray">{new Date(photo.date).toLocaleDateString()}</p>
                <div className="mt-2 flex gap-3">
                  <button onClick={() => handleEdit(photo)} className="text-accent-cyan text-sm font-semibold" disabled={saving}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(photo.id)} className="text-accent-pink text-sm font-semibold" disabled={saving}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
          <p className="text-neutral-dark-gray">No photos yet.</p>
        </div>
      )}
    </div>
  )
}
