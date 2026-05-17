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
  photos: 'Photo Updates',
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
    if (mode === 'upload') return 'Best move: drag a photo, PDF, Word doc, Sheet, or Slide here. Images auto-compress before upload.'
    return 'Paste a Google Doc/Sheet/Slide/Drive/YouTube/website URL. Parents see an embedded preview when possible, not a blind Drive jump.'
  }, [mode])

  const resetForm = () => {
    setTitle('')
    setUrl('')
    setNote('')
    setFile(null)
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
      if (target === 'photos' && mode === 'import' && !sourceType.includes('Google') && sourceType !== 'Image') {
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

  return (
    <section className={`admin-doc-card ${compact ? 'p-5' : 'p-6'}`}>
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-kicker">Quick Resource Post</p>
          <h2 className="admin-section-title">Upload or import once. Post anywhere.</h2>
          <p className="admin-muted">Files are saved as durable classroom resources. Public posts can be hidden without deleting the saved library copy.</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>}
      {message && <div role="status" className="mb-4 rounded-xl border border-accent-sky-blue/35 bg-accent-sky-blue/15 px-4 py-3 text-sm font-semibold text-accent-cyan">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="admin-field">
            <span>Where should it post?</span>
            <select value={target} onChange={event => setTarget(event.target.value as Target)} className="admin-input">
              <option value="announcements">Announcements</option>
              <option value="assignments">Assignments</option>
              <option value="links">Links</option>
              <option value="photos">Photo Updates</option>
            </select>
          </label>

          <label className="admin-field">
            <span>How is it coming in?</span>
            <select value={mode} onChange={event => setMode(event.target.value as Mode)} className="admin-input">
              <option value="upload">Drag/drop upload</option>
              <option value="import">Paste URL/import</option>
            </select>
          </label>

          <label className="admin-field">
            <span>Title parents/students see</span>
            <input value={title} onChange={event => setTitle(event.target.value)} className="admin-input" placeholder="Weekly reading slides" required dir="ltr" />
          </label>
        </div>

        {mode === 'upload' ? (
          <div
            className={`admin-upload-zone ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); handleFiles(event.dataTransfer.files) }}
          >
            <input ref={fileInputRef} type="file" className="sr-only" onChange={event => handleFiles(event.target.files)} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
            <div>
              <p className="text-lg font-black text-neutral-dark-gray">Drop a file here</p>
              <p className="text-sm font-semibold text-neutral-medium-gray">Images auto-compress for web. PDFs, Word, Sheets, and Slides save to the classroom resource library.</p>
              {file && <p className="mt-2 text-sm font-black text-accent-purple">Selected: {file.name}</p>}
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
            {saving ? 'Saving...' : `Save + Post to ${targetLabels[target]}`}
          </button>
        </div>
      </form>
    </section>
  )
}
