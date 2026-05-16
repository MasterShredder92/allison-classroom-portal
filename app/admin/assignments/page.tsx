'use client'

import { useEffect, useState } from 'react'
import AdminQuickResourcePost from '@/components/AdminQuickResourcePost'

interface Assignment {
  id: string
  class_id: string
  title: string
  description: string
  due_date: string
  resource_url?: string
  file_url?: string
}

interface Class {
  id: string
  slug: string
  display_name: string
}

async function getApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    class_id: '',
    title: '',
    description: '',
    due_date: '',
    resource_url: '',
    file_url: '',
  })

  useEffect(() => {
    Promise.all([fetch('/api/assignments'), fetch('/api/classes')])
      .then(async ([aRes, cRes]) => {
        if (aRes.ok) {
          const data = await aRes.json()
          setAssignments(data.data.sort((a: Assignment, b: Assignment) => new Date(b.due_date || '').getTime() - new Date(a.due_date || '').getTime()))
        }
        if (cRes.ok) {
          const data = await cRes.json()
          setClasses(data.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const refreshAssignments = async () => {
    const res = await fetch('/api/assignments')
    if (!res.ok) {
      setError(await getApiError(res, 'Could not load assignments.'))
      return
    }
    const data = await res.json()
    setAssignments(data.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingId ? 'PUT' : 'POST'
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/assignments', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          ...formData,
          visibility: 'public',
          status: 'active',
        }),
      })

      if (!response.ok) {
        setError(await getApiError(response, 'Assignment could not be saved. Check the fields and try again.'))
        return
      }

      setFormData({ class_id: '', title: '', description: '', due_date: '', resource_url: '', file_url: '' })
      setEditingId(null)
      setShowForm(false)
      await refreshAssignments()
    } catch (error) {
      console.error('Error saving assignment:', error)
      setError('Assignment could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return
    setError(null)
    try {
      const response = await fetch('/api/assignments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        setError(await getApiError(response, 'Assignment could not be deleted.'))
        return
      }

      await refreshAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      setError('Assignment could not be deleted. Check your connection and try again.')
    }
  }

  const handleEdit = (assignment: Assignment) => {
    setError(null)
    setFormData({
      class_id: assignment.class_id,
      title: assignment.title,
      description: assignment.description || '',
      due_date: assignment.due_date || '',
      resource_url: assignment.resource_url || '',
      file_url: assignment.file_url || '',
    })
    setEditingId(assignment.id)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-text">Assignments</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setError(null)
            setFormData({ class_id: '', title: '', description: '', due_date: '', resource_url: '', file_url: '' })
          }}
          className="bg-accent-cyan text-white px-4 py-2 rounded font-semibold hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'New Assignment'}
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
            <label className="mb-2 block text-sm font-bold text-neutral-text">Class</label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="admin-input"
                dir="ltr"
              required
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.display_name}
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

          <div>
            <label className="mb-2 block text-sm font-bold text-neutral-text">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="admin-textarea h-24"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-text">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="admin-input"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-text">Resource URL</label>
              <input
                type="url"
                value={formData.resource_url}
                onChange={(e) => setFormData({ ...formData, resource_url: e.target.value })}
                className="admin-input"
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" className="bg-accent-cyan text-white px-6 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-60" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      ) : assignments.length > 0 ? (
        <div className="space-y-2">
          {assignments.map(assignment => (
            <div key={assignment.id} className="admin-doc-card flex items-start justify-between p-4">
              <div className="flex-1">
                <p className="font-semibold text-neutral-text">{assignment.title}</p>
                <p className="text-sm text-neutral-dark-gray">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(assignment)} className="text-accent-cyan text-sm font-semibold" disabled={saving}>
                  Edit
                </button>
                <button onClick={() => handleDelete(assignment.id)} className="text-accent-pink text-sm font-semibold" disabled={saving}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
          <p className="text-neutral-dark-gray">No assignments yet.</p>
        </div>
      )}
    </div>
  )
}
