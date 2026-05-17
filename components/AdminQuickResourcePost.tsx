'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface ClassOption {
  id: string
  display_name: string
}

type Target = 'announcements' | 'assignments' | 'links' | 'photos'
type SourceType = 'Auto detect' | 'Google Doc' | 'Google Sheet' | 'Google Slide' | 'Google Form' | 'Google Drive File' | 'PDF' | 'Image' | 'Website' | 'Video' | 'Other'
type Mode = 'upload' | 'import'

const sourceTypes: SourceType[] = ['Auto detect', 'Google Doc', 'Google Sheet', 'Google Slide', 'Google Form', 'Google Drive File', 'PDF', 'Image', 'Website', 'Video', 'Other']

const targetLabels: Record<Target, string> = {
  announcements: 'Announcement',
  assignments: 'Assignment',
  links: 'Link Library',
  photos: 'Photo Update',
}

const targetOptions: Array<{ value: Target; label: string; icon: string; helper: string }> = [
  { value: 'announcements', label: 'Announcements', icon: '📢', helper: 'News update' },
  { value: 'assignments', label: 'Assignments', icon: '📚', helper: 'Class task' },
  { value: 'links', label: 'Links', icon: '🔗', helper: 'Useful resource' },
  { value: 'photos', label: 'Photos', icon: '📷', helper: 'Class moment' },
]

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

function inferResourceType(sourceType: SourceType, url: string) {
  const lower = url.toLowerCase()
  if (sourceType === 'Image') return 'image'
  if (sourceType === 'PDF') return 'pdf'
  if (sourceType === 'Video') return 'video'
  if (sourceType.includes('Google')) return 'drive_link'
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'video'
  if (lower.includes('docs.google.com') || lower.includes('drive.google.com')) return 'drive_link'
  if (lower.endsWith('.pdf')) return 'pdf'
  return 'external_link'
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

export default function AdminQuickResourcePost({ compact = false }: { compact?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<Mode>('upload')
  const [target, setTarget] = useState<Target>('announcements')
  const [sourceType, setSourceType] = useState<SourceType>('Auto detect')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
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
    if (mode === 'upload') return 'Drag in a photo, PDF, Word doc, Sheet, or Slide. Images auto-compress before upload.'
    return 'Paste a Google Doc/Sheet/Slide/Drive/YouTube/website URL. Parents get the cleanest preview the portal can generate.'
  }, [mode])

  const resetForm = () => {
    setTitle('')
    setUrl('')
    setNote('')
    setFile(null)
    setSourceType('Auto detect')
    setDueDate(todayPlus(7))
  }

  const token = () => localStorage.getItem('adminToken') || ''

  const createPublicPost = async (resource: Record<string, any>) => {
    const resourceUrl = String(resource.embed_url || resource.public_url || resource.original_url || '')
    const resourceTitle = title.trim() || String(resource.title || 'Classroom Resource')
    const description = note.trim() || String(resource.description || '')
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
    }

    let endpoint = '/api/announcements'
    let body: Record<string, unknown> = {}

    if (target === 'announcements') {
      body = {
        title: resourceTitle,
        body: description || 'New classroom resource shared.',
        link_url: resourceUrl,
        attachment_url: resourceUrl,
        pinned: false,
        visibility: 'public',
        date: new Date().toISOString().split('T')[0],
      }
    }

    if (target === 'assignments') {
      if (!classId) throw new Error('Pick a class before posting this assignment.')
      endpoint = '/api/assignments'
      body = {
        class_id: classId,
        title: resourceTitle,
        description: description || 'Resource attached.',
        due_date: dueDate,
        resource_type: inferResourceType(sourceType, resourceUrl),
        resource_url: resourceUrl,
        visibility: 'public',
        status: 'active',
      }
    }

    if (target === 'links') {
      endpoint = '/api/links'
      body = {
        category: linkCategory,
        title: resourceTitle,
        url: resourceUrl,
        description: description || String(resource.resource_kind || sourceType),
        active: true,
        sort_order: 999,
      }
    }

    if (target === 'photos') {
      endpoint = '/api/photo-updates'
      body = {
        title: resourceTitle,
        caption: description || resourceTitle,
        image_url: resourceUrl,
        date: new Date().toISOString().split('T')[0],
        visibility: 'public',
      }
    }

    const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
    if (!response.ok) throw new Error(await getApiError(response, 'Resource saved, but could not post it to the selected section.'))
    return response.json()
  }

  const createPostReference = async (resourceId: string) => {
    await fetch(`/api/resources/${resourceId}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ targetType: target.slice(0, -1), active: true }),
    }).catch(error => console.warn('Could not create resource post reference:', error))
  }

  const uploadResource = async () => {
    if (!file) throw new Error('Drop or select a file first.')
    const preparedFile = await compressImage(file)
    const formData = new FormData()
    formData.append('file', preparedFile)
    formData.append('title', title.trim() || preparedFile.name)
    formData.append('description', note.trim())
    formData.append('postedTarget', target.slice(0, -1))

    const response = await fetch('/api/resources/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: formData,
    })

    if (!response.ok) throw new Error(await getApiError(response, 'Could not upload this file.'))
    const payload = await response.json()
    return payload.data
  }

  const importResource = async () => {
    if (!url.trim()) throw new Error('Paste a URL first.')
    const response = await fetch('/api/resources/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        title: title.trim() || undefined,
        description: note.trim() || undefined,
        url: url.trim(),
        resourceKind: sourceType === 'Auto detect' ? 'auto' : sourceType,
        postedTarget: target.slice(0, -1),
      }),
    })

    if (!response.ok) throw new Error(await getApiError(response, 'Could not import this URL.'))
    const payload = await response.json()
    return payload.data
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      if (target === 'photos' && mode === 'import' && !sourceType.includes('Google') && sourceType !== 'Image' && sourceType !== 'Auto detect') {
        throw new Error('For Photo Updates, upload an image or paste a direct/Google image link.')
      }
      const resource = mode === 'upload' ? await uploadResource() : await importResource()
      await createPublicPost(resource)
      if (resource?.id) await createPostReference(resource.id)
      setMessage(`${targetLabels[target]} posted and saved to the resource library.`)
      resetForm()
    } catch (error) {
      console.error('Quick resource post failed:', error)
      setError(error instanceof Error ? error.message : 'Could not save this resource. Check the fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0]
    if (!nextFile) return
    setFile(nextFile)
    if (!title.trim()) setTitle(nextFile.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
    setMode('upload')
  }

  const methodLabel = mode === 'upload' ? 'Upload file' : 'Import URL'

  return (
    <section className={`admin-doc-card ${compact ? 'p-5' : 'p-5 sm:p-6'}`}>
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-kicker">Unified Post Tool</p>
          <h2 className="admin-section-title">Post once from the dashboard.</h2>
          <p className="admin-muted">Pick the content type, add the parent-facing details, then upload or import the resource. No duplicate section pages.</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>}
      {message && <div role="status" className="mb-4 rounded-xl border border-accent-sky-blue/35 bg-accent-sky-blue/15 px-4 py-3 text-sm font-semibold text-accent-cyan">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-5" dir="ltr">
        <fieldset className="space-y-3">
          <legend className="admin-field-label">Content type</legend>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {targetOptions.map(option => {
              const active = target === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  data-target={option.value}
                  aria-pressed={active}
                  onClick={() => setTarget(option.value)}
                  className={`admin-toggle-chip ${active ? 'active' : ''}`}
                >
                  <span className="text-2xl" aria-hidden="true">{option.icon}</span>
                  <span className="font-black">{option.label}</span>
                  <span className="text-[0.72rem] font-bold opacity-75">{option.helper}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <label className="admin-field">
          <span>Title</span>
          <input value={title} onChange={event => setTitle(event.target.value)} className="admin-input" placeholder="Weekly reading slides" required dir="ltr" />
        </label>

        <label className="admin-field">
          <span>Notes</span>
          <textarea value={note} onChange={event => setNote(event.target.value)} className="admin-textarea min-h-24" placeholder="Tell students or parents what to do with this." dir="ltr" />
        </label>

        <fieldset className="space-y-3">
          <legend className="admin-field-label">Method</legend>
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-accent-sky-blue/10 p-2">
            <button type="button" onClick={() => setMode('upload')} className={`admin-method-toggle ${mode === 'upload' ? 'active' : ''}`} aria-pressed={mode === 'upload'}>
              Upload file
            </button>
            <button type="button" onClick={() => setMode('import')} className={`admin-method-toggle ${mode === 'import' ? 'active' : ''}`} aria-pressed={mode === 'import'}>
              Import URL
            </button>
          </div>
          <p className="text-sm font-semibold text-neutral-dark-gray">{helperText}</p>
        </fieldset>

        {mode === 'upload' ? (
          <div
            className={`admin-upload-zone ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); handleFiles(event.dataTransfer.files) }}
          >
            <input ref={fileInputRef} type="file" className="sr-only" onChange={event => handleFiles(event.target.files)} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
            <div className="flex flex-col gap-1">
              <p className="text-3xl" aria-hidden="true">⬆️</p>
              <p className="text-xl font-black text-neutral-text">Drop a file here</p>
              <p className="text-sm font-bold text-neutral-dark-gray">Photos, PDFs, Word docs, Sheets, and Slides are saved to the classroom resource library.</p>
              {file && <p className="mt-2 rounded-full bg-white/80 px-3 py-2 text-sm font-black text-accent-purple shadow-sm">Selected: {file.name}</p>}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="admin-secondary-button">Choose file</button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <label className="admin-field">
              <span>Paste URL</span>
              <input type="url" value={url} onChange={event => setUrl(event.target.value)} className="admin-input" placeholder="https://docs.google.com/..." required={mode === 'import'} dir="ltr" />
            </label>
            <label className="admin-field">
              <span>What is it?</span>
              <select value={sourceType} onChange={event => setSourceType(event.target.value as SourceType)} className="admin-input">
                {sourceTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>
        )}

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

        <div className="flex flex-col gap-3 rounded-3xl border border-accent-sky-blue/25 bg-accent-sky-blue/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-neutral-text">Ready to post to {targetLabels[target]} by {methodLabel}.</p>
            <p className="text-xs font-semibold text-neutral-dark-gray">This creates the public post and saves the reusable resource record.</p>
          </div>
          <button type="submit" disabled={saving} className="admin-primary-button">
            {saving ? 'Saving...' : 'Save + Post'}
          </button>
        </div>
      </form>
    </section>
  )
}
