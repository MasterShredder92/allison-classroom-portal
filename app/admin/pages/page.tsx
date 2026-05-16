"use client"

import { useEffect, useMemo, useRef, useState } from 'react'

interface PageContent {
  id?: string
  slug: string
  title: string
  body_markdown: string
  updated_at?: string
}

const textColors = [
  { label: 'Black', value: '#2f2a24' },
  { label: 'Gray', value: '#665f55' },
  { label: 'Cyan', value: '#008f94' },
  { label: 'Pink', value: '#c9367f' },
  { label: 'Purple', value: '#7456c8' },
  { label: 'Green', value: '#28624f' },
  { label: 'Red', value: '#b42318' },
  { label: 'Yellow', value: '#8a5a00' },
]

const highlightColors = [
  { label: 'None', value: 'transparent' },
  { label: 'Yellow', value: '#fff1a8' },
  { label: 'Pink', value: '#ffd4ea' },
  { label: 'Cyan', value: '#c8fbff' },
  { label: 'Lavender', value: '#e3ddff' },
  { label: 'Green', value: '#dff8e8' },
]

async function getApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json()
    return payload?.error || payload?.message || fallback
  } catch {
    return fallback
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function pageUrl(slug: string) {
  if (slug === 'about' || slug === 'contact') return `/${slug}`
  return `/pages/${slug}`
}

function emptyPage(): PageContent {
  return {
    slug: '',
    title: '',
    body_markdown: '<p>Start typing here...</p>',
  }
}

export default function AdminPagesPage() {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const loadedEditorKeyRef = useRef<string>('')
  const savedRangeRef = useRef<Range | null>(null)
  const [pages, setPages] = useState<PageContent[]>([])
  const [selectedSlug, setSelectedSlug] = useState('about')
  const [currentPage, setCurrentPage] = useState<PageContent | null>(null)
  const [isNewPage, setIsNewPage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const protectedPage = useMemo(() => ['about', 'contact'].includes(currentPage?.slug || selectedSlug), [currentPage?.slug, selectedSlug])

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
  })

  const saveSelection = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange()
    }
  }

  const restoreSelection = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || !savedRangeRef.current) {
      editor?.focus()
      return
    }
    editor.focus()
    selection.removeAllRanges()
    selection.addRange(savedRangeRef.current)
  }

  const loadEditorHtml = (page: PageContent | null, force = false) => {
    if (!editorRef.current || !page) return
    const key = `${page.id || page.slug || 'new'}:${page.updated_at || ''}:${isNewPage ? 'new' : 'saved'}`
    if (!force && loadedEditorKeyRef.current === key) return
    editorRef.current.innerHTML = page.body_markdown || '<p></p>'
    editorRef.current.setAttribute('dir', 'ltr')
    editorRef.current.style.color = '#2f2a24'
    editorRef.current.style.backgroundColor = '#ffffff'
    loadedEditorKeyRef.current = key
  }

  const readEditorHtml = () => editorRef.current?.innerHTML || currentPage?.body_markdown || ''

  const loadPages = async () => {
    setError(null)
    const response = await fetch('/api/page-content')
    if (!response.ok) {
      setError(await getApiError(response, 'Could not load pages.'))
      setLoading(false)
      return
    }

    const payload = await response.json()
    const loadedPages = (payload.data || []) as PageContent[]
    setPages(loadedPages)

    const nextPage = loadedPages.find(page => page.slug === selectedSlug) || loadedPages[0] || null
    setCurrentPage(nextPage)
    setSelectedSlug(nextPage?.slug || '')
    setIsNewPage(false)
    setLoading(false)
    window.setTimeout(() => loadEditorHtml(nextPage, true), 0)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadPages().catch(error => {
        console.error('Error loading pages:', error)
        setError('Could not load pages. Try refreshing the dashboard.')
        setLoading(false)
      })
    }, 0)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadEditorHtml(currentPage)
    // Do not depend on the whole currentPage object. Replacing innerHTML on every keystroke breaks cursor position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage?.id, currentPage?.slug, currentPage?.updated_at, isNewPage])

  const selectPage = (slug: string) => {
    const page = pages.find(item => item.slug === slug)
    if (!page) return
    setError(null)
    setSuccess(null)
    setSelectedSlug(slug)
    setCurrentPage(page)
    setIsNewPage(false)
    window.setTimeout(() => loadEditorHtml(page, true), 0)
  }

  const startNewPage = () => {
    setError(null)
    setSuccess(null)
    const page = emptyPage()
    loadedEditorKeyRef.current = ''
    savedRangeRef.current = null
    setCurrentPage(page)
    setSelectedSlug('')
    setIsNewPage(true)
    window.setTimeout(() => loadEditorHtml(page, true), 0)
  }

  const runCommand = (command: string, value?: string) => {
    restoreSelection()
    document.execCommand(command, false, value)
    saveSelection()
  }

  const formatBlock = (tag: string) => {
    restoreSelection()
    document.execCommand('formatBlock', false, tag)
    saveSelection()
  }

  const insertLink = () => {
    restoreSelection()
    const url = window.prompt('Paste the link URL')
    if (!url) return
    runCommand('createLink', url)
  }

  const savePage = async () => {
    if (!currentPage) return
    const body = readEditorHtml()
    const slug = currentPage.slug || slugify(currentPage.title)

    if (!currentPage.title.trim()) {
      setError('Add a page title before saving.')
      return
    }
    if (!slug) {
      setError('Add a simple page URL before saving, like classroom-rules.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const pagePayload = {
        title: currentPage.title.trim(),
        body_markdown: body,
      }
      const response = await fetch(isNewPage ? '/api/page-content' : `/api/page-content/${slug}`, {
        method: isNewPage ? 'POST' : 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(isNewPage ? { slug, ...pagePayload } : pagePayload),
      })

      if (!response.ok) {
        setError(await getApiError(response, 'Page could not be saved.'))
        return
      }

      const payloadResponse = await response.json()
      const saved = payloadResponse.data as PageContent
      const refreshed = pages.filter(page => page.slug !== saved.slug).concat(saved).sort((a, b) => a.title.localeCompare(b.title))
      setPages(refreshed)
      setCurrentPage(saved)
      setSelectedSlug(saved.slug)
      setIsNewPage(false)
      setSuccess('Saved. The public site updates immediately—no code, no deploy, no extra step.')
      window.setTimeout(() => loadEditorHtml(saved, true), 0)
    } catch (error) {
      console.error('Error saving page:', error)
      setError('Page could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const deletePage = async () => {
    if (!currentPage || protectedPage) return
    const confirmed = window.confirm(`Delete "${currentPage.title}"? This removes the public page.`)
    if (!confirmed) return

    setDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/page-content/${currentPage.slug}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      if (!response.ok) {
        setError(await getApiError(response, 'Page could not be deleted.'))
        return
      }

      const remaining = pages.filter(page => page.slug !== currentPage.slug)
      setPages(remaining)
      const nextPage = remaining[0] || null
      setCurrentPage(nextPage)
      setSelectedSlug(nextPage?.slug || '')
      setIsNewPage(false)
      setSuccess('Deleted. The page has been removed from the public site.')
      window.setTimeout(() => loadEditorHtml(nextPage, true), 0)
    } catch (error) {
      console.error('Error deleting page:', error)
      setError('Page could not be deleted. Check your connection and try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="py-12 text-center text-neutral-text">Loading pages...</div>

  return (
    <div dir="ltr">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="admin-kicker">Google Docs-style editor</p>
          <h1 className="font-serif text-4xl font-black text-neutral-text">Edit Site Pages</h1>
          <p className="admin-muted">Black text on a white page, normal typing, simple formatting, color controls, and instant public updates after saving.</p>
        </div>
        <button type="button" onClick={startNewPage} className="rounded-xl bg-accent-cyan px-5 py-3 font-black text-white hover:opacity-90">
          Add New Page
        </button>
      </div>

      {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>}
      {success && <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="admin-doc-card p-4">
          <h2 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-neutral-dark-gray">Pages</h2>
          <div className="space-y-2">
            {pages.map(page => (
              <button
                key={page.slug}
                type="button"
                onClick={() => selectPage(page.slug)}
                className={`w-full rounded-xl px-4 py-3 text-left font-bold transition-colors ${selectedSlug === page.slug && !isNewPage ? 'bg-accent-cyan text-white' : 'bg-neutral-off-white text-neutral-text hover:bg-accent-cyan/10'}`}
              >
                {page.title}
                <span className="mt-1 block text-xs font-semibold opacity-75">{pageUrl(page.slug)}</span>
              </button>
            ))}
            {isNewPage && <div className="rounded-xl bg-accent-yellow/50 px-4 py-3 font-bold text-neutral-text">New page draft</div>}
          </div>
        </aside>

        <section className="admin-doc-card p-5">
          {currentPage ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <label className="admin-field">
                  <span>Page Title</span>
                  <input
                    value={currentPage.title}
                    onChange={event => {
                      const title = event.target.value
                      setCurrentPage({ ...currentPage, title, slug: isNewPage ? slugify(title) : currentPage.slug })
                    }}
                    className="admin-input"
                    placeholder="Classroom Rules"
                    dir="ltr"
                  />
                </label>
                <label className="admin-field">
                  <span>Page URL</span>
                  <input
                    value={currentPage.slug}
                    onChange={event => setCurrentPage({ ...currentPage, slug: slugify(event.target.value) })}
                    disabled={!isNewPage}
                    className="admin-input disabled:bg-neutral-off-white disabled:text-neutral-dark-gray"
                    placeholder="classroom-rules"
                    dir="ltr"
                  />
                </label>
              </div>

              <div className="admin-editor-frame">
                <div className="admin-editor-toolbar" aria-label="Text formatting toolbar">
                  <div className="admin-toolbar-group" aria-label="Text style">
                    <button type="button" onMouseDown={event => { event.preventDefault(); formatBlock('p') }} className="admin-editor-button">Normal</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); formatBlock('h2') }} className="admin-editor-button">Title</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); formatBlock('h3') }} className="admin-editor-button">Subhead</button>
                  </div>

                  <div className="admin-toolbar-group" aria-label="Basic formatting">
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('bold') }} className="admin-editor-button font-black">B</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('italic') }} className="admin-editor-button italic">I</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('underline') }} className="admin-editor-button underline">U</button>
                  </div>

                  <div className="admin-toolbar-group" aria-label="Alignment">
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('justifyLeft') }} className="admin-editor-button">Left</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('justifyCenter') }} className="admin-editor-button">Center</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('justifyRight') }} className="admin-editor-button">Right</button>
                  </div>

                  <div className="admin-toolbar-group" aria-label="Lists and links">
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('insertUnorderedList') }} className="admin-editor-button">Bullets</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('insertOrderedList') }} className="admin-editor-button">Numbers</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); insertLink() }} className="admin-editor-button">Link</button>
                    <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('removeFormat') }} className="admin-editor-button">Clear</button>
                  </div>

                  <label className="admin-color-control" onMouseDown={saveSelection}>
                    <span>Text</span>
                    <select
                      defaultValue="#2f2a24"
                      onFocus={saveSelection}
                      onChange={event => runCommand('foreColor', event.target.value)}
                      className="admin-color-select"
                    >
                      {textColors.map(color => <option key={color.value} value={color.value}>{color.label}</option>)}
                    </select>
                  </label>

                  <label className="admin-color-control" onMouseDown={saveSelection}>
                    <span>Highlight</span>
                    <select
                      defaultValue="transparent"
                      onFocus={saveSelection}
                      onChange={event => runCommand('hiliteColor', event.target.value)}
                      className="admin-color-select"
                    >
                      {highlightColors.map(color => <option key={color.value} value={color.value}>{color.label}</option>)}
                    </select>
                  </label>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  dir="ltr"
                  className="admin-editor-surface admin-page-editor-surface"
                  aria-label="Page body editor"
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  onFocus={saveSelection}
                  onInput={saveSelection}
                  spellCheck
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={savePage} disabled={saving} className="rounded-xl bg-accent-cyan px-6 py-3 font-black text-white hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Page'}
                </button>
                {currentPage.slug && !isNewPage && (
                  <a href={pageUrl(currentPage.slug)} target="_blank" rel="noreferrer" className="rounded-xl border border-neutral-medium-gray px-5 py-3 font-bold text-neutral-text hover:bg-neutral-off-white">
                    View Public Page
                  </a>
                )}
                {!protectedPage && !isNewPage && (
                  <button type="button" onClick={deletePage} disabled={deleting} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-800 hover:bg-red-100 disabled:opacity-60">
                    {deleting ? 'Deleting...' : 'Delete Page'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-neutral-off-white p-8 text-center font-semibold text-neutral-dark-gray">Click Add New Page to create the first editable page.</div>
          )}
        </section>
      </div>
    </div>
  )
}
