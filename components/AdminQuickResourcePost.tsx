'use client'

import { useEffect, useMemo, useState } from 'react'

interface ClassOption {
  id: string
  display_name: string
}

type Target = 'announcements' | 'assignments' | 'links'
type SourceType = 'Google Doc' | 'Google Sheet' | 'Google Slide' | 'Google Form' | 'PDF' | 'Website' | 'Video' | 'Other'

const sourceTypes: SourceType[] = ['Google Doc', 'Google Sheet', 'Google Slide', 'Google Form', 'PDF', 'Website', 'Video', 'Other']
const targetLabels: Record<Target, string> = {
  announcements: 'Announcement',
  assignments: 'Assignment',
  links: 'Link Library',
}

async function getApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

function todayPlus(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export default function AdminQuickResourcePost({ compact = false }: { compact?: boolean }) {
  const [target, setTarget] = useState<Target>('announcements')
  const [sourceType, setSourceType] = useState<SourceType>('Google Doc')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [classId, setClassId] = useState('')
  const [dueDate, setDueDate] = useState(todayPlus(7))
  const [linkCategory, setLinkCategory] = useState('classroom_tools')
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/classes')
      .then(async response => {
        if (!response.ok) return
        const payload = await response.json()
        const loadedClasses = (payload.data || []) as ClassOption[]
        setClasses(loadedClasses)
        if (loadedClasses[0]?.id) setClassId(loadedClasses[0].id)
      })
      .catch(error => console.error('Could not load classes for quick post:', error))
  }, [])

  const helperText = useMemo(() => {
    if (target === 'announcements') return 'Posts a classroom announcement with the URL attached.'
    if (target === 'assignments') return 'Creates an assignment and attaches the URL as the resource link.'
    return 'Adds the URL to the public Links page.'
  }, [target])

  const resetForm = () => {
    setTitle('')
    setUrl('')
    setNote('')
    setDueDate(todayPlus(7))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const token = localStorage.getItem('adminToken') || ''
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      let endpoint = '/api/announcements'
      let body: Record<string, unknown> = {}

      if (target === 'announcements') {
        body = {
          title: title.trim(),
          body: note.trim() || `${sourceType} shared for class.`,
          link_url: url.trim(),
          attachment_url: url.trim(),
          pinned: false,
          visibility: 'public',
          date: new Date().toISOString().split('T')[0],
        }
      }

      if (target === 'assignments') {
        if (!classId) {
          setError('Pick a class before posting this assignment.')
          setSaving(false)
          return
        }
        endpoint = '/api/assignments'
        body = {
          class_id: classId,
          title: title.trim(),
          description: note.trim() || `${sourceType} resource attached.`,
          due_date: dueDate,
          resource_type: sourceType.startsWith('Google') ? 'drive_link' : 'external_link',
          resource_url: url.trim(),
          visibility: 'public',
          status: 'active',
        }
      }

      if (target === 'links') {
        endpoint = '/api/links'
        body = {
          category: linkCategory,
          title: title.trim(),
          url: url.trim(),
          description: note.trim() || sourceType,
          active: true,
          sort_order: 999,
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        setError(await getApiError(response, 'Could not post this resource. Check the fields and try again.'))
        return
      }

      setMessage(`${targetLabels[target]} posted.`)
      resetForm()
    } catch (error) {
      console.error('Quick resource post failed:', error)
      setError('Could not post this resource. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={`admin-doc-card ${compact ? 'p-5' : 'p-6'}`}>
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-kicker">Quick URL Post</p>
          <h2 className="admin-section-title">Attach a Google file or resource</h2>
          <p className="admin-muted">Paste one URL, choose the source type, then decide where it should show up.</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>}
      {message && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="admin-field">
            <span>Where should it post?</span>
            <select value={target} onChange={event => setTarget(event.target.value as Target)} className="admin-input">
              <option value="announcements">Announcements</option>
              <option value="assignments">Assignments</option>
              <option value="links">Links</option>
            </select>
          </label>

          <label className="admin-field">
            <span>What is it from?</span>
            <select value={sourceType} onChange={event => setSourceType(event.target.value as SourceType)} className="admin-input">
              {sourceTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <label className="admin-field">
            <span>Title parents/students see</span>
            <input value={title} onChange={event => setTitle(event.target.value)} className="admin-input" placeholder="Weekly reading slides" required dir="ltr" />
          </label>
        </div>

        <label className="admin-field">
          <span>Paste URL</span>
          <input type="url" value={url} onChange={event => setUrl(event.target.value)} className="admin-input" placeholder="https://docs.google.com/..." required dir="ltr" />
        </label>

        <label className="admin-field">
          <span>Short note</span>
          <textarea value={note} onChange={event => setNote(event.target.value)} className="admin-textarea min-h-24" placeholder="Optional: tell students or parents what to do with this." dir="ltr" />
        </label>

        {target === 'assignments' && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-field">
              <span>Class</span>
              <select value={classId} onChange={event => setClassId(event.target.value)} className="admin-input" required>
                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.display_name}</option>)}
              </select>
            </label>
            <label className="admin-field">
              <span>Due date</span>
              <input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} className="admin-input" required />
            </label>
          </div>
        )}

        {target === 'links' && (
          <label className="admin-field max-w-sm">
            <span>Link category</span>
            <select value={linkCategory} onChange={event => setLinkCategory(event.target.value)} className="admin-input">
              <option value="classroom_tools">Classroom tools</option>
              <option value="curriculum">Curriculum</option>
              <option value="reading">Reading</option>
              <option value="school">School</option>
              <option value="gradebook">Gradebook</option>
              <option value="other">Other</option>
            </select>
          </label>
        )}

        <div className="flex flex-col gap-3 rounded-2xl bg-neutral-off-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-neutral-dark-gray">{helperText}</p>
          <button type="submit" disabled={saving} className="rounded-xl bg-accent-cyan px-5 py-3 text-sm font-black text-white shadow-sm hover:opacity-90 disabled:opacity-60">
            {saving ? 'Posting...' : `Post to ${targetLabels[target]}`}
          </button>
        </div>
      </form>
    </section>
  )
}
