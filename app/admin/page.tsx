'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  announcements: number
  assignments: number
  photoUpdates: number
  links: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [announcementsRes, assignmentsRes, photosRes, linksRes] = await Promise.all([
          fetch('/api/announcements'),
          fetch('/api/assignments'),
          fetch('/api/photo-updates'),
          fetch('/api/links'),
        ])

        let announcementCount = 0
        let assignmentCount = 0
        let photoCount = 0
        let linkCount = 0

        if (announcementsRes.ok) {
          const data = await announcementsRes.json()
          announcementCount = data.data?.length || 0
        }

        if (assignmentsRes.ok) {
          const data = await assignmentsRes.json()
          assignmentCount = data.data?.length || 0
        }

        if (photosRes.ok) {
          const data = await photosRes.json()
          photoCount = data.data?.length || 0
        }

        if (linksRes.ok) {
          const data = await linksRes.json()
          linkCount = data.data?.length || 0
        }

        setStats({
          announcements: announcementCount,
          assignments: assignmentCount,
          photoUpdates: photoCount,
          links: linkCount,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-6 rounded-lg border border-neutral-medium-gray">
            <p className="text-neutral-dark-gray text-sm font-semibold uppercase tracking-wide mb-2">
              Announcements
            </p>
            <p className="font-serif text-4xl font-bold text-accent-pink">{stats.announcements}</p>
            <Link
              href="/admin/announcements"
              className="text-accent-cyan text-sm hover:underline mt-4 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-medium-gray">
            <p className="text-neutral-dark-gray text-sm font-semibold uppercase tracking-wide mb-2">
              Assignments
            </p>
            <p className="font-serif text-4xl font-bold text-accent-cyan">{stats.assignments}</p>
            <Link
              href="/admin/assignments"
              className="text-accent-cyan text-sm hover:underline mt-4 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-medium-gray">
            <p className="text-neutral-dark-gray text-sm font-semibold uppercase tracking-wide mb-2">
              Photo Updates
            </p>
            <p className="font-serif text-4xl font-bold text-accent-lavender">{stats.photoUpdates}</p>
            <Link
              href="/admin/photos"
              className="text-accent-cyan text-sm hover:underline mt-4 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-medium-gray">
            <p className="text-neutral-dark-gray text-sm font-semibold uppercase tracking-wide mb-2">
              Links
            </p>
            <p className="font-serif text-4xl font-bold text-accent-sky-blue">{stats.links}</p>
            <Link href="/admin/links" className="text-accent-cyan text-sm hover:underline mt-4 inline-block">
              Manage →
            </Link>
          </div>
        </div>
      ) : null}

      <div className="bg-white p-6 rounded-lg border border-neutral-medium-gray">
        <h2 className="font-serif text-2xl font-semibold text-neutral-text mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/announcements"
            className="bg-neutral-light-gray p-4 rounded-lg hover:bg-neutral-medium-gray transition-colors"
          >
            <p className="font-semibold text-neutral-text mb-1">New Announcement</p>
            <p className="text-neutral-dark-gray text-sm">Post a news update</p>
          </Link>

          <Link
            href="/admin/assignments"
            className="bg-neutral-light-gray p-4 rounded-lg hover:bg-neutral-medium-gray transition-colors"
          >
            <p className="font-semibold text-neutral-text mb-1">New Assignment</p>
            <p className="text-neutral-dark-gray text-sm">Add a class assignment</p>
          </Link>

          <Link
            href="/admin/photos"
            className="bg-neutral-light-gray p-4 rounded-lg hover:bg-neutral-medium-gray transition-colors"
          >
            <p className="font-semibold text-neutral-text mb-1">Photo Update</p>
            <p className="text-neutral-dark-gray text-sm">Share classroom photos</p>
          </Link>

          <Link
            href="/admin/schedule"
            className="bg-neutral-light-gray p-4 rounded-lg hover:bg-neutral-medium-gray transition-colors"
          >
            <p className="font-semibold text-neutral-text mb-1">Update Schedule</p>
            <p className="text-neutral-dark-gray text-sm">Change class schedule</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
