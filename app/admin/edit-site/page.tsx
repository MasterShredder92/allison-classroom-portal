'use client'

import { useEffect, useMemo, useState } from 'react'

type SiteSetting = {
  key: string
  label: string
  description: string
  group_name: string
  field_type: 'text' | 'textarea' | 'url'
  value: string
  sort_order: number
}

type Notice = {
  type: 'success' | 'error'
  message: string
} | null

export default function AdminEditSitePage() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/site-settings')
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Could not load editable site fields')
        }

        const rows: SiteSetting[] = data.data || []
        setSettings(rows)
        setValues(rows.reduce((acc, setting) => {
          acc[setting.key] = setting.value || ''
          return acc
        }, {} as Record<string, string>))
      } catch (error) {
        setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not load editable site fields' })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const groupedSettings = useMemo(() => {
    return settings.reduce((groups, setting) => {
      const group = setting.group_name || 'Site Content'
      if (!groups[group]) groups[group] = []
      groups[group].push(setting)
      return groups
    }, {} as Record<string, SiteSetting[]>)
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setNotice(null)

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('Admin session expired. Log in again.')

      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: values }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        const issueMessage = data.issues?.[0]?.message
        throw new Error(issueMessage || data.error || 'Could not save site edits')
      }

      const rows: SiteSetting[] = data.data || []
      setSettings(rows)
      setValues(rows.reduce((acc, setting) => {
        acc[setting.key] = setting.value || ''
        return acc
      }, {} as Record<string, string>))
      setNotice({ type: 'success', message: 'Site edits saved. The public site updates without a GitHub deploy.' })
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not save site edits' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-4xl font-black text-neutral-text">Edit Site</h1>
          <p className="mt-2 text-neutral-dark-gray">Loading editable fields...</p>
        </div>
        <div className="h-48 animate-pulse rounded-[1.5rem] bg-white/70" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent-pink">Safe content controls</p>
          <h1 className="mt-2 font-serif text-4xl font-black text-neutral-text">Edit Site</h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-neutral-dark-gray">
            Update small copy and button links without touching GitHub, design files, or deployment settings.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-accent-cyan px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Site Edits'}
        </button>
      </div>

      {notice && (
        <div className={`rounded-[1.25rem] border-2 px-5 py-4 text-sm font-black ${notice.type === 'success' ? 'border-accent-sky-blue/45 bg-accent-sky-blue/18 text-neutral-text' : 'border-accent-pink/45 bg-accent-pink/15 text-neutral-text'}`}>
          {notice.message}
        </div>
      )}

      <div className="rounded-[1.5rem] border-2 border-accent-sky-blue/35 bg-accent-sky-blue/14 p-5 shadow-sm">
        <h2 className="font-serif text-2xl font-black text-neutral-text">What Allison can safely edit</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-neutral-dark-gray">
          This first version controls homepage wording and CTA links only. Links can be internal paths like <code className="rounded bg-white/70 px-1">/links</code> or full URLs like Google Classroom.
        </p>
      </div>

      {Object.entries(groupedSettings).map(([group, groupSettings]) => (
        <section key={group} className="rounded-[1.75rem] border-2 border-accent-sky-blue/35 bg-white/80 p-5 shadow-xl shadow-sky-100/70 backdrop-blur md:p-6">
          <div className="mb-5 border-b-2 border-accent-sky-blue/20 pb-3">
            <h2 className="font-serif text-2xl font-black text-neutral-text">{group}</h2>
          </div>

          <div className="grid gap-5">
            {groupSettings.map((setting) => (
              <label key={setting.key} className="block">
                <span className="block text-sm font-black text-neutral-text">{setting.label}</span>
                <span className="mt-1 block text-xs font-bold leading-5 text-neutral-dark-gray">{setting.description}</span>
                {setting.field_type === 'textarea' ? (
                  <textarea
                    value={values[setting.key] || ''}
                    onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))}
                    rows={4}
                    className="mt-2 w-full rounded-[1rem] border-2 border-accent-sky-blue/25 bg-white px-4 py-3 text-sm font-bold text-neutral-text outline-none transition focus:border-accent-pink"
                  />
                ) : (
                  <input
                    type={setting.field_type === 'url' ? 'text' : 'text'}
                    value={values[setting.key] || ''}
                    onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))}
                    className="mt-2 w-full rounded-full border-2 border-accent-sky-blue/25 bg-white px-4 py-3 text-sm font-bold text-neutral-text outline-none transition focus:border-accent-pink"
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
