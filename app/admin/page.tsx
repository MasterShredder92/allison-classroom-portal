'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminQuickResourcePost from '@/components/AdminQuickResourcePost'

interface DashboardStats {
  announcements: number
  assignments: number
  photoUpdates: number
  links: number
}

const statCards: Array<{
  key: keyof DashboardStats
  label: string
  tone: string
  icon: string
}> = [
  { key: 'announcements', label: 'Announcements', tone: 'text-accent-pink', icon: '📢' },
  { key: 'assignments', label: 'Assignments', tone: 'text-accent-cyan', icon: '📚' },
  { key: 'links', label: 'Links', tone: 'text-accent-sky-blue', icon: '🔗' },
  { key: 'photoUpdates', label: 'Photos', tone: 'text-accent-lavender', icon: '📷' },
]

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
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-kicker">Admin Home</p>
          <h1 className="font-serif text-3xl font-bold text-neutral-text sm:text-4xl">Dashboard</h1>
        </div>
        <Link href="/admin/edit-site" className="admin-secondary-button w-full sm:w-auto">
          Edit Site
        </Link>
      </div>

      {loading ? (
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-accent-sky-blue/12" />
          ))}
        </div>
      ) : stats ? (
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map(card => (
            <div key={card.key} className="admin-stat-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.68rem] font-black uppercase tracking-wide text-neutral-dark-gray sm:text-xs">
                  {card.label}
                </p>
                <span className="text-lg" aria-hidden="true">{card.icon}</span>
              </div>
              <p className={`font-serif text-3xl font-black sm:text-4xl ${card.tone}`}>{stats[card.key]}</p>
            </div>
          ))}
        </div>
      ) : null}

      <AdminQuickResourcePost />

      <div className="admin-doc-card mt-8 p-5 sm:p-6">
        <div className="mb-4">
          <p className="admin-kicker">Admin Tools</p>
          <h2 className="admin-section-title">Site-level edits</h2>
          <p className="admin-muted">Content posting now happens above. These buttons are only for workflows that are not regular posts.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/admin/logs"
            className="rounded-2xl border border-accent-cyan/35 bg-accent-cyan/12 p-4 transition hover:-translate-y-0.5 hover:bg-accent-cyan/20"
          >
            <p className="font-black text-neutral-text">Manage Logs</p>
            <p className="mt-1 text-sm font-semibold text-neutral-dark-gray">Filter, edit, or delete announcements, assignments, links, and photos.</p>
          </Link>

          <Link
            href="/admin/schedule"
            className="rounded-2xl border border-accent-sky-blue/35 bg-accent-sky-blue/12 p-4 transition hover:-translate-y-0.5 hover:bg-accent-sky-blue/20"
          >
            <p className="font-black text-neutral-text">Update Schedule</p>
            <p className="mt-1 text-sm font-semibold text-neutral-dark-gray">Change the public class schedule image, link, or notes.</p>
          </Link>

          <Link
            href="/admin/edit-site"
            className="rounded-2xl border border-accent-pink/35 bg-accent-pink/12 p-4 transition hover:-translate-y-0.5 hover:bg-accent-pink/20"
          >
            <p className="font-black text-neutral-text">Edit Site</p>
            <p className="mt-1 text-sm font-semibold text-neutral-dark-gray">Edit homepage text and button links without code.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
