'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

const typeLabels = {
  announcements: 'Announcement',
  assignments: 'Assignment',
  links: 'Link',
  photos: 'Photo',
} as const

const endpointByType = {
  announcements: '/api/announcements',
  assignments: '/api/assignments',
  links: '/api/links',
  photos: '/api/photo-updates',
} as const

type ContentType = keyof typeof typeLabels
type TypeFilter = 'all' | ContentType
type RangeFilter = 'all' | '7' | '30' | '90'

type ClassOption = {
  id: string
  grade?: string | null
  subject?: string | null
  display_name?: string | null
  slug?: string | null
}

type AnnouncementRecord = {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
  visibility: 'public' | 'link_only' | 'draft'
  attachment_url?: string | null
  link_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type AssignmentRecord = {
  id: string
  class_id: string
  title: string
  description?: string | null
  due_date?: string | null
  resource_type?: 'drive_link' | 'download' | 'external_link' | null
  resource_url?: string | null
  file_url?: string | null
  visibility: 'public' | 'link_only' | 'restricted' | 'draft'
  status: 'active' | 'archived'
  created_at?: string | null
  updated_at?: string | null
  classes?: ClassOption | null
}

type LinkRecord = {
  id: string
  category: 'gradebook' | 'school' | 'classroom_tools' | 'reading' | 'curriculum' | 'other'
  title: string
  url: string
  description?: string | null
  audience?: string | null
  sort_order?: number | null
  active: boolean
  created_at?: string | null
  updated_at?: string | null
}

type PhotoRecord = {
  id: string
  title?: string | null
  caption?: string | null
  image_url: string
  date: string
  visibility: 'public' | 'draft'
  created_at?: string | null
  updated_at?: string | null
}

type LogEntry =
  | { type: 'announcements'; record: AnnouncementRecord }
  | { type: 'assignments'; record: AssignmentRecord }
  | { type: 'links'; record: LinkRecord }
  | { type: 'photos'; record: PhotoRecord }

type LogsResponse = {
  data?: {
    announcements?: AnnouncementRecord[]
    assignments?: AssignmentRecord[]
    links?: LinkRecord[]
    photos?: PhotoRecord[]
    classes?: ClassOption[]
  }
  error?: string
}

type EditDraft = Record<string, string | boolean | number>

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
  }
}

function readApiError(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'error' in data) {
    const value = (data as { error?: unknown }).error
    if (typeof value === 'string') return value
  }
  return fallback
}

function getTitle(entry: LogEntry) {
  if (entry.type === 'photos') return entry.record.title?.trim() || 'Untitled photo'
  return entry.record.title
}

function getSummary(entry: LogEntry) {
  if (entry.type === 'announcements') return entry.record.body || ''
  if (entry.type === 'assignments') return entry.record.description || ''
  if (entry.type === 'links') return entry.record.description || entry.record.url
  return entry.record.caption || entry.record.image_url
}

function getEntryDate(entry: LogEntry) {
  if (entry.type === 'announcements' || entry.type === 'photos') return entry.record.date
  return entry.record.created_at || entry.record.updated_at || ''
}

function getUpdatedAt(entry: LogEntry) {
  return entry.record.updated_at || entry.record.created_at || getEntryDate(entry)
}

function formatDate(value?: string | null) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function toDateInput(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function classLabel(option?: ClassOption | null) {
  if (!option) return 'Class'
  return option.display_name || [option.grade, option.subject].filter(Boolean).join(' ') || option.slug || 'Class'
}

function draftFromEntry(entry: LogEntry): EditDraft {
  if (entry.type === 'announcements') {
    return {
      title: entry.record.title,
      body: entry.record.body,
      date: toDateInput(entry.record.date),
      pinned: entry.record.pinned,
      visibility: entry.record.visibility,
      attachment_url: entry.record.attachment_url || '',
      link_url: entry.record.link_url || '',
    }
  }

  if (entry.type === 'assignments') {
    return {
      class_id: entry.record.class_id,
      title: entry.record.title,
      description: entry.record.description || '',
      due_date: toDateInput(entry.record.due_date),
      resource_type: entry.record.resource_type || 'external_link',
      resource_url: entry.record.resource_url || '',
      file_url: entry.record.file_url || '',
      visibility: entry.record.visibility,
      status: entry.record.status,
    }
  }

  if (entry.type === 'links') {
    return {
      category: entry.record.category,
      title: entry.record.title,
      url: entry.record.url,
      description: entry.record.description || '',
      audience: entry.record.audience || 'everyone',
      sort_order: entry.record.sort_order ?? 0,
      active: entry.record.active,
    }
  }

  return {
    title: entry.record.title || '',
    caption: entry.record.caption || '',
    image_url: entry.record.image_url,
    date: toDateInput(entry.record.date),
    visibility: entry.record.visibility,
  }
}

function buildPayload(entry: LogEntry, draft: EditDraft) {
  if (entry.type === 'announcements') {
    return {
      id: entry.record.id,
      title: String(draft.title || '').trim(),
      body: String(draft.body || '').trim(),
      date: String(draft.date || '').slice(0, 10),
      pinned: Boolean(draft.pinned),
      visibility: String(draft.visibility || 'public'),
      attachment_url: String(draft.attachment_url || '').trim(),
      link_url: String(draft.link_url || '').trim(),
    }
  }

  if (entry.type === 'assignments') {
    return {
      id: entry.record.id,
      class_id: String(draft.class_id || '').trim(),
      title: String(draft.title || '').trim(),
      description: String(draft.description || '').trim(),
      due_date: String(draft.due_date || '').slice(0, 10),
      resource_type: String(draft.resource_type || 'external_link'),
      resource_url: String(draft.resource_url || '').trim(),
      file_url: String(draft.file_url || '').trim(),
      visibility: String(draft.visibility || 'public'),
      status: String(draft.status || 'active'),
    }
  }

  if (entry.type === 'links') {
    return {
      id: entry.record.id,
      category: String(draft.category || 'other'),
      title: String(draft.title || '').trim(),
      url: String(draft.url || '').trim(),
      description: String(draft.description || '').trim(),
      audience: String(draft.audience || 'everyone').trim(),
      sort_order: Number(draft.sort_order || 0),
      active: Boolean(draft.active),
    }
  }

  return {
    id: entry.record.id,
    title: String(draft.title || '').trim(),
    caption: String(draft.caption || '').trim(),
    image_url: String(draft.image_url || '').trim(),
    date: String(draft.date || '').slice(0, 10),
    visibility: String(draft.visibility || 'draft'),
  }
}

export default function AdminLogsPage() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [selectedKey, setSelectedKey] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<EditDraft>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadLogs = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/logs', { headers: authHeaders() })
      const data = (await response.json().catch(() => ({}))) as LogsResponse

      if (!response.ok) throw new Error(readApiError(data, 'Could not load logs.'))

      const payload = data.data || {}
      const combined: LogEntry[] = [
        ...(payload.announcements || []).map(record => ({ type: 'announcements' as const, record })),
        ...(payload.assignments || []).map(record => ({ type: 'assignments' as const, record })),
        ...(payload.links || []).map(record => ({ type: 'links' as const, record })),
        ...(payload.photos || []).map(record => ({ type: 'photos' as const, record })),
      ].sort((a, b) => new Date(getUpdatedAt(b)).getTime() - new Date(getUpdatedAt(a)).getTime())

      setEntries(combined)
      setClasses(payload.classes || [])

      if (!selectedKey && combined.length > 0) {
        const firstKey = `${combined[0].type}:${combined[0].record.id}`
        setSelectedKey(firstKey)
        setDraft(draftFromEntry(combined[0]))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedEntry = useMemo(
    () => entries.find(entry => `${entry.type}:${entry.record.id}` === selectedKey) || null,
    [entries, selectedKey]
  )

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const now = Date.now()
    const rangeDays = rangeFilter === 'all' ? null : Number(rangeFilter)

    return entries.filter(entry => {
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false

      if (rangeDays) {
        const entryTime = new Date(getEntryDate(entry) || getUpdatedAt(entry)).getTime()
        if (!Number.isNaN(entryTime)) {
          const ageDays = (now - entryTime) / 86_400_000
          if (ageDays > rangeDays) return false
        }
      }

      if (!normalizedQuery) return true

      const haystack = [typeLabels[entry.type], getTitle(entry), getSummary(entry), getEntryDate(entry)]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [entries, typeFilter, rangeFilter, query])

  const counts = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc[entry.type] += 1
        return acc
      },
      { announcements: 0, assignments: 0, links: 0, photos: 0 } as Record<ContentType, number>
    )
  }, [entries])

  const selectEntry = (entry: LogEntry) => {
    setSelectedKey(`${entry.type}:${entry.record.id}`)
    setDraft(draftFromEntry(entry))
    setError('')
    setNotice('')
  }

  const setField = (name: string, value: string | boolean | number) => {
    setDraft(current => ({ ...current, [name]: value }))
  }

  const saveEntry = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedEntry) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = buildPayload(selectedEntry, draft)
      const response = await fetch(endpointByType[selectedEntry.type], {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) throw new Error(readApiError(data, `Could not save ${typeLabels[selectedEntry.type].toLowerCase()}.`))

      setNotice(`${typeLabels[selectedEntry.type]} updated.`)
      await loadLogs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async () => {
    if (!selectedEntry) return

    const confirmed = window.confirm(`Delete this ${typeLabels[selectedEntry.type].toLowerCase()}? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(endpointByType[selectedEntry.type], {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ id: selectedEntry.record.id }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) throw new Error(readApiError(data, `Could not delete ${typeLabels[selectedEntry.type].toLowerCase()}.`))

      const remaining = entries.filter(entry => `${entry.type}:${entry.record.id}` !== selectedKey)
      setEntries(remaining)
      setSelectedKey('')
      setDraft({})
      setNotice(`${typeLabels[selectedEntry.type]} deleted.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const renderEditor = () => {
    if (!selectedEntry) {
      return (
        <div className="admin-doc-card p-5 sm:p-6">
          <p className="font-black text-neutral-text">No log selected.</p>
          <p className="admin-muted">Pick an item from the left to edit or delete it.</p>
        </div>
      )
    }

    if (selectedEntry.type === 'announcements') {
      return (
        <>
          <label className="admin-field">
            <span>Title</span>
            <input className="admin-input" value={String(draft.title || '')} onChange={event => setField('title', event.target.value)} required />
          </label>
          <label className="admin-field">
            <span>Notes</span>
            <textarea className="admin-textarea min-h-36" value={String(draft.body || '')} onChange={event => setField('body', event.target.value)} required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-field">
              <span>Date</span>
              <input type="date" className="admin-input" value={String(draft.date || '')} onChange={event => setField('date', event.target.value)} required />
            </label>
            <label className="admin-field">
              <span>Visibility</span>
              <select className="admin-input" value={String(draft.visibility || 'public')} onChange={event => setField('visibility', event.target.value)}>
                <option value="public">Public</option>
                <option value="link_only">Link only</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-field">
              <span>Attachment URL</span>
              <input className="admin-input" value={String(draft.attachment_url || '')} onChange={event => setField('attachment_url', event.target.value)} placeholder="https://..." />
            </label>
            <label className="admin-field">
              <span>Link URL</span>
              <input className="admin-input" value={String(draft.link_url || '')} onChange={event => setField('link_url', event.target.value)} placeholder="https://..." />
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-accent-pink/10 p-3 font-bold text-neutral-text">
            <input type="checkbox" checked={Boolean(draft.pinned)} onChange={event => setField('pinned', event.target.checked)} />
            Pin this announcement
          </label>
        </>
      )
    }

    if (selectedEntry.type === 'assignments') {
      return (
        <>
          <label className="admin-field">
            <span>Title</span>
            <input className="admin-input" value={String(draft.title || '')} onChange={event => setField('title', event.target.value)} required />
          </label>
          <label className="admin-field">
            <span>Notes</span>
            <textarea className="admin-textarea min-h-32" value={String(draft.description || '')} onChange={event => setField('description', event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-field">
              <span>Class</span>
              <select className="admin-input" value={String(draft.class_id || '')} onChange={event => setField('class_id', event.target.value)} required>
                {classes.map(option => (
                  <option key={option.id} value={option.id}>{classLabel(option)}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Due date</span>
              <input type="date" className="admin-input" value={String(draft.due_date || '')} onChange={event => setField('due_date', event.target.value)} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="admin-field">
              <span>Resource type</span>
              <select className="admin-input" value={String(draft.resource_type || 'external_link')} onChange={event => setField('resource_type', event.target.value)}>
                <option value="external_link">External link</option>
                <option value="drive_link">Drive link</option>
                <option value="download">Download</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Visibility</span>
              <select className="admin-input" value={String(draft.visibility || 'public')} onChange={event => setField('visibility', event.target.value)}>
                <option value="public">Public</option>
                <option value="link_only">Link only</option>
                <option value="restricted">Restricted</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Status</span>
              <select className="admin-input" value={String(draft.status || 'active')} onChange={event => setField('status', event.target.value)}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-field">
              <span>Resource URL</span>
              <input className="admin-input" value={String(draft.resource_url || '')} onChange={event => setField('resource_url', event.target.value)} placeholder="https://..." />
            </label>
            <label className="admin-field">
              <span>File URL</span>
              <input className="admin-input" value={String(draft.file_url || '')} onChange={event => setField('file_url', event.target.value)} placeholder="https://..." />
            </label>
          </div>
        </>
      )
    }

    if (selectedEntry.type === 'links') {
      return (
        <>
          <label className="admin-field">
            <span>Title</span>
            <input className="admin-input" value={String(draft.title || '')} onChange={event => setField('title', event.target.value)} required />
          </label>
          <label className="admin-field">
            <span>Link URL</span>
            <input className="admin-input" value={String(draft.url || '')} onChange={event => setField('url', event.target.value)} required placeholder="https://..." />
          </label>
          <label className="admin-field">
            <span>Notes</span>
            <textarea className="admin-textarea min-h-28" value={String(draft.description || '')} onChange={event => setField('description', event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="admin-field">
              <span>Category</span>
              <select className="admin-input" value={String(draft.category || 'other')} onChange={event => setField('category', event.target.value)}>
                <option value="gradebook">Gradebook</option>
                <option value="school">School</option>
                <option value="classroom_tools">Classroom tools</option>
                <option value="reading">Reading</option>
                <option value="curriculum">Curriculum</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Audience</span>
              <input className="admin-input" value={String(draft.audience || 'everyone')} onChange={event => setField('audience', event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Sort order</span>
              <input type="number" className="admin-input" value={Number(draft.sort_order || 0)} onChange={event => setField('sort_order', Number(event.target.value || 0))} />
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-accent-sky-blue/12 p-3 font-bold text-neutral-text">
            <input type="checkbox" checked={Boolean(draft.active)} onChange={event => setField('active', event.target.checked)} />
            Active link
          </label>
        </>
      )
    }

    return (
      <>
        <label className="admin-field">
          <span>Title</span>
          <input className="admin-input" value={String(draft.title || '')} onChange={event => setField('title', event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Caption / notes</span>
          <textarea className="admin-textarea min-h-28" value={String(draft.caption || '')} onChange={event => setField('caption', event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Photo URL</span>
          <input className="admin-input" value={String(draft.image_url || '')} onChange={event => setField('image_url', event.target.value)} required placeholder="https://..." />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="admin-field">
            <span>Date</span>
            <input type="date" className="admin-input" value={String(draft.date || '')} onChange={event => setField('date', event.target.value)} required />
          </label>
          <label className="admin-field">
            <span>Visibility</span>
            <select className="admin-input" value={String(draft.visibility || 'draft')} onChange={event => setField('visibility', event.target.value)}>
              <option value="public">Public</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>
      </>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-kicker">Admin Logs</p>
          <h1 className="font-serif text-3xl font-bold text-neutral-text sm:text-4xl">Manage Posts</h1>
          <p className="admin-muted">Filter every announcement, assignment, link, and photo. Edit one item at a time or delete it safely.</p>
        </div>
        <button type="button" onClick={loadLogs} className="admin-secondary-button w-full sm:w-auto" disabled={loading}>
          Refresh
        </button>
      </div>

      {error ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div> : null}
      {notice ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-700">{notice}</div> : null}

      <div className="admin-doc-card mb-6 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="admin-field">
            <span>Search logs</span>
            <input className="admin-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, notes, URL, or date..." />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {(['all', '7', '30', '90'] as RangeFilter[]).map(range => (
              <button
                key={range}
                type="button"
                onClick={() => setRangeFilter(range)}
                className={`admin-log-chip ${rangeFilter === range ? 'active' : ''}`}
              >
                {range === 'all' ? 'All Time' : `${range} Days`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <button type="button" onClick={() => setTypeFilter('all')} className={`admin-log-chip ${typeFilter === 'all' ? 'active' : ''}`}>
            All <span>{entries.length}</span>
          </button>
          {(Object.keys(typeLabels) as ContentType[]).map(type => (
            <button key={type} type="button" onClick={() => setTypeFilter(type)} className={`admin-log-chip ${typeFilter === type ? 'active' : ''}`}>
              {typeLabels[type]}s <span>{counts[type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.82fr)_1.18fr]">
        <div className="admin-doc-card overflow-hidden">
          <div className="border-b border-neutral-text/10 p-4 sm:p-5">
            <p className="admin-kicker">Results</p>
            <h2 className="admin-section-title">{loading ? 'Loading...' : `${filteredEntries.length} items`}</h2>
          </div>
          <div className="max-h-[70vh] overflow-auto p-3">
            {filteredEntries.map(entry => {
              const key = `${entry.type}:${entry.record.id}`
              const selected = key === selectedKey
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectEntry(entry)}
                  className={`admin-log-row ${selected ? 'active' : ''}`}
                >
                  <span className="admin-log-row-top">
                    <strong>{getTitle(entry)}</strong>
                    <em>{typeLabels[entry.type]}</em>
                  </span>
                  <span className="admin-log-row-summary">{getSummary(entry) || 'No notes'}</span>
                  <span className="admin-log-row-meta">{formatDate(getEntryDate(entry))}</span>
                </button>
              )
            })}
            {!loading && filteredEntries.length === 0 ? (
              <div className="rounded-2xl bg-neutral-off-white p-5 text-sm font-bold text-neutral-dark-gray">No logs match that filter.</div>
            ) : null}
          </div>
        </div>

        <form onSubmit={saveEntry} className="admin-doc-card p-5 sm:p-6">
          {selectedEntry ? (
            <div className="mb-5 flex flex-col gap-2 border-b border-neutral-text/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="admin-kicker">Selected {typeLabels[selectedEntry.type]}</p>
                <h2 className="admin-section-title">{getTitle(selectedEntry)}</h2>
                <p className="admin-muted">Last changed: {formatDate(getUpdatedAt(selectedEntry))}</p>
              </div>
              <button type="button" onClick={deleteEntry} className="admin-danger-button w-full sm:w-auto" disabled={deleting || saving}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ) : null}

          <div className="grid gap-4">{renderEditor()}</div>

          {selectedEntry ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => selectEntry(selectedEntry)} className="admin-secondary-button w-full sm:w-auto" disabled={saving || deleting}>
                Reset
              </button>
              <button type="submit" className="admin-primary-button w-full sm:w-auto" disabled={saving || deleting}>
                {saving ? 'Saving...' : `Save ${typeLabels[selectedEntry.type]}`}
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  )
}
