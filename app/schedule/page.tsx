"use client"

import { useEffect, useMemo, useState } from 'react'

interface ScheduleRecord {
  id?: string
  title?: string
  image_url?: string
  notes?: string
  active?: boolean
  updated_at?: string
}

function extractUrlFromTeacherInput(input?: string) {
  const value = input?.trim()
  if (!value) return ''

  const iframeSrc = value.match(/src=["']([^"']+)["']/i)?.[1]
  if (iframeSrc) return iframeSrc.replace(/&amp;/g, '&')

  return value
}

function getGoogleCalendarEmbedUrl(input?: string) {
  const rawUrl = extractUrlFromTeacherInput(input)
  if (!rawUrl) return ''

  try {
    const url = new URL(rawUrl)
    if (!url.hostname.includes('calendar.google.com')) return ''

    if (url.pathname.includes('/calendar/embed')) return url.toString()

    const src = url.searchParams.get('src')
    const ctz = url.searchParams.get('ctz') || 'America/Chicago'
    const embedUrl = new URL('https://calendar.google.com/calendar/embed')

    if (src) embedUrl.searchParams.set('src', src)
    embedUrl.searchParams.set('ctz', ctz)
    embedUrl.searchParams.set('mode', url.searchParams.get('mode') || 'WEEK')

    return embedUrl.toString()
  } catch {
    return ''
  }
}

function getSafeLinkUrl(input?: string) {
  const rawUrl = extractUrlFromTeacherInput(input)
  if (!rawUrl) return ''

  try {
    const url = new URL(rawUrl)
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString()
    return ''
  } catch {
    return ''
  }
}

function isImageUrl(input?: string) {
  const rawUrl = extractUrlFromTeacherInput(input)
  if (!rawUrl) return false
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(rawUrl)
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/schedule')
        if (res.ok) {
          const data = await res.json()
          setSchedule(data.data || null)
        }
      } catch (error) {
        console.error('Error fetching schedule:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const calendarEmbedUrl = useMemo(() => getGoogleCalendarEmbedUrl(schedule?.image_url), [schedule?.image_url])
  const safeScheduleLink = useMemo(() => getSafeLinkUrl(schedule?.image_url), [schedule?.image_url])
  const showImage = isImageUrl(schedule?.image_url) && !calendarEmbedUrl

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card notebook-lines rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Class Schedule</span>
          <h1 className="mt-4 font-serif text-5xl font-black leading-none tracking-tight text-neutral-text sm:text-6xl">
            {schedule?.title || 'Schedule'}
          </h1>
          <p className="mt-4 text-lg font-bold leading-8 text-neutral-dark-gray">
            Check this page for classroom timing, recurring blocks, important calendar updates, and schedule notes.
          </p>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-[520px] animate-pulse rounded-[1.5rem] bg-white/80" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/80" />
          </div>
        ) : schedule ? (
          <div className="space-y-6">
            {calendarEmbedUrl ? (
              <div className="space-y-4 rounded-[1.5rem] border border-neutral-medium-gray/70 bg-white p-3 shadow-sm">
                <div className="overflow-hidden rounded-[1.25rem] border border-neutral-medium-gray/50 bg-white">
                  <iframe
                    title="Classroom Google Calendar"
                    src={calendarEmbedUrl}
                    className="h-[620px] w-full border-0 sm:h-[720px]"
                    loading="lazy"
                  />
                </div>
                {safeScheduleLink && (
                  <a href={safeScheduleLink} target="_blank" rel="noreferrer" className="inline-flex rounded-xl bg-accent-cyan px-5 py-3 font-black text-white hover:opacity-90">
                    Open Schedule / Calendar
                  </a>
                )}
              </div>
            ) : showImage && safeScheduleLink ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-neutral-medium-gray/70 bg-white p-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={safeScheduleLink} alt={schedule.title || 'Class schedule'} className="w-full rounded-[1.25rem]" />
              </div>
            ) : safeScheduleLink ? (
              <div className="rounded-[1.5rem] border border-neutral-medium-gray/70 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-accent-cyan">Schedule Link</p>
                <a href={safeScheduleLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-accent-cyan px-5 py-3 font-black text-white hover:opacity-90">
                  Open Schedule / Calendar
                </a>
              </div>
            ) : null}

            {schedule.notes && (
              <div className="rounded-[1.5rem] border border-neutral-medium-gray/70 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-accent-cyan">Schedule Notes</p>
                <p className="mt-3 whitespace-pre-line leading-7 text-neutral-dark-gray">{schedule.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state rounded-[2rem] p-10 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-lavender/25 text-3xl">📅</div>
            <h2 className="font-serif text-3xl font-black text-neutral-text">No schedule posted yet</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-dark-gray">Schedule details will appear here after they are saved in the admin dashboard.</p>
          </div>
        )}
      </section>
    </div>
  )
}
