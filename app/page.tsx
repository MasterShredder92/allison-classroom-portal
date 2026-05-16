'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AnnouncementCard from '@/components/AnnouncementCard'
import AssignmentCard from '@/components/AssignmentCard'
import QuickLinkBar from '@/components/QuickLinkBar'

interface Announcement {
  id: string
  title: string
  body: string
  date: string
  pinned?: boolean
  attachment_url?: string
  link_url?: string
}

interface Assignment {
  id: string
  class_id: string
  title: string
  description: string
  due_date: string
  resource_type?: string
  resource_url?: string
  file_url?: string
}

interface Class {
  id: string
  slug: string
  display_name: string
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, assignmentsRes, classesRes] = await Promise.all([
          fetch('/api/announcements'),
          fetch('/api/assignments'),
          fetch('/api/classes'),
        ])

        if (announcementsRes.ok) {
          const data = await announcementsRes.json()
          setAnnouncements(data.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3))
        }

        if (assignmentsRes.ok) {
          const data = await assignmentsRes.json()
          setAssignments(data.data.slice(0, 6))
        }

        if (classesRes.ok) {
          const data = await classesRes.json()
          setClasses(data.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Section */}
      <section className="mb-12">
        <h1 className="font-serif text-4xl font-bold text-neutral-text mb-2">
          Welcome to Allison's Classroom
        </h1>
        <p className="text-neutral-dark-gray text-lg">
          Stay updated on announcements, assignments, and classroom happenings.
        </p>
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-neutral-text mb-6">Quick Links</h2>
        <QuickLinkBar />
      </section>

      {/* Latest Announcements */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-neutral-text">Latest News</h2>
          <Link href="/news" className="text-accent-cyan hover:underline font-semibold">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
          <p className="text-neutral-dark-gray text-center py-8">No announcements yet.</p>
        )}
      </section>

      {/* Recent Assignments */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-neutral-text mb-6">Recent Assignments</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-neutral-light-gray rounded-lg animate-pulse" />
            ))}
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-dark-gray text-center py-8">No assignments yet.</p>
        )}
      </section>

      {/* Classes Overview */}
      <section>
        <h2 className="font-serif text-2xl font-semibold text-neutral-text mb-6">Classes</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-neutral-light-gray rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map(cls => (
              <Link
                key={cls.id}
                href={`/classes/${cls.slug}`}
                className="bg-neutral-light-gray p-6 rounded-lg border-l-4 border-accent-cyan hover:shadow-md transition-shadow"
              >
                <p className="font-serif text-lg font-semibold text-neutral-text hover:text-accent-cyan">
                  {cls.display_name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
