'use client'

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
          const sorted = data.data.sort((a: any, b: any) => {
            if (a.pinned && !b.pinned) return -1
            if (!a.pinned && b.pinned) return 1
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          })
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">Classroom News</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-32 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-dark-gray text-lg">No announcements yet.</p>
        </div>
      )}
    </div>
  )
}
