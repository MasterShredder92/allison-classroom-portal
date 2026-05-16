"use client"

import { useEffect, useMemo, useRef, useState } from 'react'

interface PageContent {
  id?: string
  slug: string
  title: string
  body_markdown: string
  updated_at?: string
}

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

  const syncEditorToState = () => {
    if (!editorRef.current || !currentPage) return
    setCurrentPage({ ...currentPage, body_markdown: editorRef.current.innerHTML })
  }

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
    if (!editorRef.current || !currentPage) return
    editorRef.current.innerHTML = currentPage.body_markdown || ''
  }, [currentPage])

  const selectPage = (slug: string) => {
    const page = pages.find(item => item.slug === slug)
    if (!page) return
    setError(null)
    setSuccess(null)
    setSelectedSlug(slug)
    setCurrentPage(page)
    setIsNewPage(false)
  }

  const startNewPage = () => {
    setError(null)
    setSuccess(null)
    const page = emptyPage()
    setCurrentPage(page)
    setSelectedSlug('')
    setIsNewPage(true)
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = page.body_markdown
    }, 0)
  }

  const runCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    syncEditorToState()
  }

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag)
    syncEditorToState()
  }

  const savePage = async () => {
    if (!currentPage) return
    syncEditorToState()
    const body = editorRef.current?.innerHTML || currentPage.body_markdown || ''
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
    } catch (error) {
      console.error('Error deleting page:', error)
      setError('Page could not be deleted. Check your connection and try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading pages...</div>

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold text-neutral-text">Edit Site Pages</h1>
          <p className="mt-3 max-w-3xl text-neutral-dark-gray">Allison can add pages, edit text, format it like a document, save it, and the public site updates immediately. No HTML. No code. No deploy button.</p>
        </div>
        <button type="button" onClick={startNewPage} className="rounded-xl bg-accent-cyan px-5 py-3 font-black text-white hover:opacity-90">
          Add New Page
        </button>
      </div>

      {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>}
      {success && <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-neutral-medium-gray bg-white p-4 shadow-sm">
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

        <section className="rounded-2xl border border-neutral-medium-gray bg-white p-5 shadow-sm">
          {currentPage ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-text">Page Title</label>
                  <input
                    value={currentPage.title}
                    onChange={event => {
                      const title = event.target.value
                      setCurrentPage({ ...currentPage, title, slug: isNewPage ? slugify(title) : currentPage.slug })
                    }}
                    className="w-full rounded-lg border border-neutral-medium-gray px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                    placeholder="Classroom Rules"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-text">Page URL</label>
                  <input
                    value={currentPage.slug}
                    onChange={event => setCurrentPage({ ...currentPage, slug: slugify(event.target.value) })}
                    disabled={!isNewPage}
                    className="w-full rounded-lg border border-neutral-medium-gray px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:bg-neutral-off-white disabled:text-neutral-dark-gray"
                    placeholder="classroom-rules"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap gap-2 rounded-xl border border-neutral-medium-gray bg-neutral-off-white p-2">
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('bold') }} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Bold</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('italic') }} className="rounded-lg bg-white px-3 py-2 text-sm italic shadow-sm">Italic</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('underline') }} className="rounded-lg bg-white px-3 py-2 text-sm underline shadow-sm">Underline</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); formatBlock('h2') }} className="rounded-lg bg-white px-3 py-2 text-sm font-black shadow-sm">Big Heading</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); formatBlock('h3') }} className="rounded-lg bg-white px-3 py-2 text-sm font-bold shadow-sm">Small Heading</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); formatBlock('p') }} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">Normal Text</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('fontSize', '2') }} className="rounded-lg bg-white px-3 py-2 text-xs shadow-sm">Small Text</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('fontSize', '4') }} className="rounded-lg bg-white px-3 py-2 text-base shadow-sm">Medium Text</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('fontSize', '6') }} className="rounded-lg bg-white px-3 py-2 text-lg font-bold shadow-sm">Large Text</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('insertUnorderedList') }} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">Bullets</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); runCommand('insertOrderedList') }} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">Numbers</button>
                  <button type="button" onMouseDown={event => { event.preventDefault(); const url = window.prompt('Paste the link URL'); if (url) runCommand('createLink', url) }} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">Link</button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncEditorToState}
                  className="rich-content min-h-[360px] rounded-xl border border-neutral-medium-gray bg-white px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
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
