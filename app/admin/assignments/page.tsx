'use client'

import { useEffect, useState } from 'react'

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

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
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
          setAssignments(data.data.sort((a: any, b: any) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()))
        }
        if (cRes.ok) {
          const data = await cRes.json()
          setClasses(data.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingId ? 'PUT' : 'POST'
    try {
      const response = await fetch('/api/assignments', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          ...formData,
          visibility: 'public',
          status: 'active',
        }),
      })

      if (response.ok) {
        setFormData({ class_id: '', title: '', description: '', due_date: '', resource_url: '', file_url: '' })
        setEditingId(null)
        setShowForm(false)
        const res = await fetch('/api/assignments')
        if (res.ok) {
          const data = await res.json()
          setAssignments(data.data)
        }
      }
    } catch (error) {
      console.error('Error saving assignment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return
    try {
      const response = await fetch('/api/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (response.ok) {
        const res = await fetch('/api/assignments')
        if (res.ok) {
          const data = await res.json()
          setAssignments(data.data)
        }
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-text">Assignments</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ class_id: '', title: '', description: '', due_date: '', resource_url: '', file_url: '' })
          }}
          className="bg-accent-cyan text-white px-4 py-2 rounded font-semibold hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-medium-gray mb-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-text mb-2">Class</label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
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
            <label className="block text-sm font-semibold text-neutral-text mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">Resource URL</label>
              <input
                type="url"
                value={formData.resource_url}
                onChange={(e) => setFormData({ ...formData, resource_url: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
          </div>

          <button type="submit" className="bg-accent-cyan text-white px-6 py-2 rounded font-semibold hover:opacity-90">
            {editingId ? 'Update' : 'Create'}
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
            <div key={assignment.id} className="bg-white p-4 rounded border border-neutral-medium-gray flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-neutral-text">{assignment.title}</p>
                <p className="text-sm text-neutral-dark-gray">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleDelete(assignment.id)} className="text-accent-pink text-sm font-semibold">
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
