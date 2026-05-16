"use client"
import { useEffect, useState } from 'react'
import AnnouncementCard from '@/components/AnnouncementCard'

interface Announcement {
  id: string
  title: string
  body: string
  date: string
  pinned?: boolean
  attachment_url?: string
  link_url?: string
}

export default function NewsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements')
        if (res.ok) {
          const data = await res.json()
          const sorted = data.data.sort((a: Announcement, b: Announcement) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setAnnouncements(sorted)
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card notebook-lines rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Bulletin Board</span>
          <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">Latest classroom news</h1>
          <p className="mt-4 text-lg leading-8 text-neutral-dark-gray">Announcements, reminders, and classroom notes for families who need the important stuff fast.</p>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-36 animate-pulse rounded-[1.5rem] bg-white/80" />)}</div>
        ) : announcements.length > 0 ? (
          <div className="space-y-5">{announcements.map(announcement => <AnnouncementCard key={announcement.id} announcement={announcement} />)}</div>
        ) : (
          <div className="empty-state rounded-[2rem] p-10 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-pink/25 text-3xl">📌</div>
            <h2 className="font-serif text-3xl font-black text-neutral-text">No announcements yet</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-dark-gray">When Allison posts classroom updates from the admin area, they will show up here in a clean parent-friendly feed.</p>
          </div>
        )}
      </section>
    </div>
  )
}

