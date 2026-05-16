'use client'

import { useEffect, useState } from 'react'

interface Photo {
  id: string
  title?: string
  caption?: string
  image_url: string
  date: string
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    image_url: '',
  })

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
    try {
      const response = await fetch('/api/photo-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          ...formData,
          date: new Date().toISOString().split('T')[0],
          visibility: 'public',
        }),
      })
      if (response.ok) {
        const res = await fetch('/api/photo-updates')
        if (res.ok) {
          const data = await res.json()
          setPhotos(data.data)
        }
        setFormData({ title: '', caption: '', image_url: '' })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error saving photo:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo?')) return
    try {
      const response = await fetch('/api/photo-updates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ id }),
      })
      if (response.ok) {
        const res = await fetch('/api/photo-updates')
        if (res.ok) {
          const data = await res.json()
          setPhotos(data.data)
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-text">Classroom Photos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent-lavender text-white px-4 py-2 rounded font-semibold hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'New Photo'}
        </button>
      </div>

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

          <button type="submit" className="bg-accent-lavender text-white px-6 py-2 rounded font-semibold hover:opacity-90">
            Upload Photo
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
                <button onClick={() => handleDelete(photo.id)} className="text-accent-pink text-sm font-semibold mt-2">
                  Delete
                </button>
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
