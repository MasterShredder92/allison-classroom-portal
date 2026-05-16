"use client"
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
  pinned: boolean
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

const classAccents = ['bg-accent-pink', 'bg-accent-yellow', 'bg-accent-cyan', 'bg-accent-sky-blue', 'bg-accent-lavender', 'bg-accent-purple']

function EmptyState({ title, body, cta, href }: { title: string; body: string; cta?: string; href?: string }) {
  return (
    <div className="empty-state rounded-[1.5rem] p-8 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent-yellow/45 text-2xl">✎</div>
      <h3 className="font-serif text-xl font-bold text-neutral-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-dark-gray">{body}</p>
      {cta && href && <Link href={href} className="mt-5 inline-flex rounded-full bg-accent-cyan px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5">{cta}</Link>}
    </div>
  )
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
          setAnnouncements(data.data.sort((a: Announcement, b: Announcement) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3))
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
    <div className="classroom-shell py-10 sm:py-14">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-neutral-medium-gray/70 bg-white/80 p-6 shadow-[0_22px_60px_rgba(65,47,25,0.12)] backdrop-blur sm:p-10 lg:p-12">
        <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-accent-pink via-accent-yellow via-accent-cyan via-accent-sky-blue to-accent-purple" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="section-eyebrow">Parent Resource Hub</span>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl font-black leading-[0.96] tracking-tight text-neutral-text sm:text-6xl lg:text-7xl">
              Welcome to Allison&apos;s Classroom.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-dark-gray sm:text-xl">
              One warm, organized place for announcements, assignments, schedules, links, and classroom moments for Allison&apos;s 5th and 6th grade families.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/news" className="focus-ring rounded-full bg-accent-cyan px-6 py-3 text-center font-black text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5">See Latest News</Link>
              <Link href="/links" className="focus-ring rounded-full border border-neutral-medium-gray bg-white px-6 py-3 text-center font-black text-neutral-text transition hover:-translate-y-0.5 hover:border-accent-pink">Open Parent Links</Link>
            </div>
          </div>

          <div className="relative min-h-[320px] rounded-[2rem] bg-[#28624f] p-5 shadow-2xl rotate-1">
            <div className="absolute inset-3 rounded-[1.5rem] border-2 border-[#d9b775]/70" />
            <div className="relative z-10 h-full rounded-[1.4rem] bg-[#315f50] p-6 text-white shadow-inner">
              <p className="font-serif text-3xl font-bold">Today in class</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-white/95 p-4 text-neutral-text rotate-[-1deg] shadow-lg">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-accent-pink">Announcements</p>
                  <p className="mt-1 font-serif text-xl font-bold">Check here first for classroom updates.</p>
                </div>
                <div className="rounded-2xl bg-accent-yellow/95 p-4 text-neutral-text rotate-1 shadow-lg">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-dark-gray">Assignments</p>
                  <p className="mt-1 font-serif text-xl font-bold">See what is due and where to find it.</p>
                </div>
                <div className="rounded-2xl bg-accent-sky-blue/95 p-4 text-neutral-text rotate-[-1deg] shadow-lg">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-dark-gray">Resources</p>
                  <p className="mt-1 font-serif text-xl font-bold">Google Classroom, gradebook, ClassDojo, and more.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="section-eyebrow">Quick Access</span>
            <h2 className="mt-3 font-serif text-3xl font-black text-neutral-text">Family shortcuts</h2>
          </div>
        </div>
        <QuickLinkBar />
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="paper-card rounded-[2rem] p-6 sm:p-8">
          <div className="relative z-10 mb-6 flex items-center justify-between gap-4">
            <div>
              <span className="section-eyebrow">Bulletin Board</span>
              <h2 className="mt-3 font-serif text-3xl font-black text-neutral-text">Latest news</h2>
            </div>
            <Link href="/news" className="rounded-full bg-white px-4 py-2 text-sm font-black text-accent-cyan shadow-sm hover:shadow-md">View all →</Link>
          </div>
          <div className="relative z-10">
            {loading ? <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/80" />)}</div> : announcements.length > 0 ? <div className="space-y-4">{announcements.map(announcement => <AnnouncementCard key={announcement.id} announcement={announcement} />)}</div> : <EmptyState title="No announcements yet" body="Allison can add the first welcome note from the admin dashboard. Once posted, it will appear here automatically." cta="Go to News" href="/news" />}
          </div>
        </section>

        <section className="paper-card rounded-[2rem] p-6 sm:p-8">
          <div className="relative z-10 mb-6">
            <span className="section-eyebrow">Student Work</span>
            <h2 className="mt-3 font-serif text-3xl font-black text-neutral-text">Recent assignments</h2>
          </div>
          <div className="relative z-10">
            {loading ? <div className="grid gap-4">{[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-3xl bg-white/80" />)}</div> : assignments.length > 0 ? <div className="grid gap-4">{assignments.map(assignment => <AssignmentCard key={assignment.id} assignment={assignment} />)}</div> : <EmptyState title="No assignments posted" body="Assignments will show here after Allison adds them by class, due date, and resource link." cta="View Classes" href="#classes" />}
          </div>
        </section>
      </div>

      <section id="classes" className="mt-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-eyebrow">Classrooms</span>
            <h2 className="mt-3 font-serif text-4xl font-black text-neutral-text">Choose a class</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-6 text-neutral-dark-gray">Each class page keeps families focused on the assignments and resources that match the student’s schedule.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 animate-pulse rounded-[1.6rem] bg-white/75" />)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, index) => (
              <Link key={cls.id} href={`/classes/${cls.slug}`} className="focus-ring bulletin-card group rounded-[1.7rem] p-6 pt-10 transition-all hover:-translate-y-1 hover:shadow-2xl">
                <span className={`mb-5 block h-2 w-20 rounded-full ${classAccents[index % classAccents.length]}`} />
                <p className="font-serif text-2xl font-black text-neutral-text group-hover:text-accent-cyan transition-colors">{cls.display_name}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-dark-gray">Open announcements, assignments, and class-specific resources.</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

