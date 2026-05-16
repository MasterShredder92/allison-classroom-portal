'use client'

import { useEffect, useState } from 'react'

async function getApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

export default function SchedulePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    notes: '',
  })

  const refreshSchedule = async () => {
    const res = await fetch('/api/schedule')
    if (!res.ok) {
      setError(await getApiError(res, 'Could not load schedule.'))
      return
    }
    await res.json()
  }

  useEffect(() => {
    fetch('/api/schedule').then(async res => {
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          setFormData({
            title: data.data.title || '',
            image_url: data.data.image_url || '',
            notes: data.data.notes || '',
          })
        }
      }
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ ...formData, active: true }),
      })
      if (!response.ok) {
        setError(await getApiError(response, 'Schedule could not be saved. Check the image URL and try again.'))
        return
      }

      await refreshSchedule()
    } catch (error) {
      console.error('Error saving schedule:', error)
      setError('Schedule could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">Class Schedule</h1>

      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-medium-gray space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-text mb-2">Title (optional)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            placeholder="Current Schedule"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-text mb-2">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            placeholder="https://example.com/schedule.jpg"
            required
          />
          <p className="text-xs text-neutral-dark-gray mt-1">Use Google Drive, Imgur, or another image hosting service</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-text mb-2">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan h-20"
            placeholder="Any schedule notes..."
          />
        </div>

        <button type="submit" className="bg-accent-cyan text-white px-6 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-60" disabled={saving}>
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </form>
    </div>
  )
}
