'use client'

import { useEffect, useRef, useState } from 'react'

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

async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/gif') return file
  if (file.size <= 1_200_000) return file

  const bitmap = await createImageBitmap(file)
  const maxSide = 1800
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return file
  context.drawImage(bitmap, 0, 0, width, height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82))
  bitmap.close()
  if (!blob) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
}

export default function PhotosPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0]
    if (!nextFile) return
    if (!nextFile.type.startsWith('image/')) {
      setError('Photo Updates need an image file. Use Quick Resource Post for PDFs, Docs, Sheets, or Slides.')
      return
    }
    setSelectedFile(nextFile)
    setFormData(current => ({
      ...current,
      title: current.title || nextFile.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
    }))
  }

  const uploadSelectedPhoto = async () => {
    if (!selectedFile) return formData.image_url
    const preparedFile = await compressImage(selectedFile)
    const data = new FormData()
    data.append('file', preparedFile)
    data.append('title', formData.title || preparedFile.name)
    data.append('description', formData.caption || '')
    data.append('postedTarget', 'photo')

    const response = await fetch('/api/resources/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}` },
      body: data,
    })

    if (!response.ok) throw new Error(await getApiError(response, 'Photo upload failed.'))
    const payload = await response.json()
    return payload.data?.public_url || payload.data?.embed_url || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingId ? 'PUT' : 'POST'
    setSaving(true)
    setError(null)
    try {
      const imageUrl = await uploadSelectedPhoto()
      if (!imageUrl) {
        setError('Drop a photo or keep an existing image URL before saving.')
        return
      }

      const response = await fetch('/api/photo-updates', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          ...formData,
          image_url: imageUrl,
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
      setSelectedFile(null)
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving photo:', error)
      setError(error instanceof Error ? error.message : 'Photo update could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo from the public photo feed? The uploaded resource file stays saved in the resource library.')) return
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
    setSelectedFile(null)
    setEditingId(photo.id)
    setShowForm(true)
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="admin-kicker">Classroom moments</p>
          <h1 className="admin-section-title">Photo Updates</h1>
          <p className="admin-muted">Drag in photos. Large images compress before upload so the site stays fast.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setSelectedFile(null)
            setError(null)
            setFormData({ title: '', caption: '', image_url: '' })
          }}
          className="admin-primary-button"
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
        <form onSubmit={handleSubmit} className="admin-doc-card mb-8 space-y-4 p-6">
          <div
            className={`admin-upload-zone ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); handleFiles(event.dataTransfer.files) }}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => handleFiles(event.target.files)} />
            <div>
              <p className="text-lg font-black text-neutral-dark-gray">Drop a classroom photo here</p>
              <p className="text-sm font-semibold text-neutral-medium-gray">No Google Drive image links. Upload it directly and the site compresses it for web.</p>
              {selectedFile && <p className="mt-2 text-sm font-black text-accent-purple">Selected: {selectedFile.name}</p>}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="admin-secondary-button">Choose photo</button>
          </div>

          <label className="admin-field">
            <span>Title</span>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="admin-input"
              placeholder="Science fair prep"
              dir="ltr"
            />
          </label>

          <label className="admin-field">
            <span>Caption</span>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="admin-textarea h-24"
              required
              dir="ltr"
            />
          </label>

          {editingId && (
            <label className="admin-field">
              <span>Existing image URL</span>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="admin-input"
                placeholder="Stored image URL"
                dir="ltr"
              />
            </label>
          )}

          <button type="submit" className="admin-primary-button" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Photo' : 'Upload + Post Photo'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-neutral-light-gray" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {photos.map(photo => (
            <div key={photo.id} className="overflow-hidden rounded-2xl border border-neutral-medium-gray bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.image_url} alt={photo.title || photo.caption || 'Classroom photo'} className="aspect-square w-full object-cover" />
              <div className="p-4">
                <p className="text-sm text-neutral-dark-gray">{new Date(photo.date).toLocaleDateString()}</p>
                {photo.title && <h2 className="mt-1 font-black text-neutral-text">{photo.title}</h2>}
                {photo.caption && <p className="mt-1 text-sm font-semibold text-neutral-dark-gray">{photo.caption}</p>}
                <div className="mt-3 flex gap-3">
                  <button onClick={() => handleEdit(photo)} className="text-sm font-semibold text-accent-cyan" disabled={saving}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(photo.id)} className="text-sm font-semibold text-accent-pink" disabled={saving}>
                    Remove from feed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-neutral-light-gray py-12 text-center">
          <p className="text-neutral-dark-gray">No photos yet.</p>
        </div>
      )}
    </div>
  )
}
