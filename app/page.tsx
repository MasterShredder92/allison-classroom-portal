"use client"
import type { CSSProperties } from 'react'
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
const classEmoji = ['✍️', '📖', '🧠', '📝', '🌎', '🏛️']

function EmptyState({ title, body, cta, href }: { title: string; body: string; cta?: string; href?: string }) {
  return (
    <div className="empty-state rounded-[1.75rem] p-8 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-accent-yellow/55 text-3xl shadow-sm">✎</div>
      <h3 className="font-serif text-2xl font-black text-neutral-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-neutral-dark-gray">{body}</p>
      {cta && href && <Link href={href} className="fun-button mt-5 rounded-full bg-accent-cyan px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-200">{cta}</Link>}
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
    <div className="classroom-shell home-polish py-8 sm:py-12">
      <section className="home-hero-gloss relative overflow-hidden rounded-[2.5rem] border-2 border-neutral-text/10 bg-white/72 p-5 shadow-[0_30px_90px_rgba(65,47,25,0.16)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-accent-pink via-accent-yellow via-accent-cyan via-accent-sky-blue to-accent-purple" />
        <span className="sticker-dot left-8 top-20 h-10 w-10 bg-accent-yellow/70 floaty" style={{ '--rotate': '9deg' } as CSSProperties} />
        <span className="sticker-dot bottom-8 right-16 h-14 w-14 bg-accent-pink/35 floaty-slow" style={{ '--rotate': '-7deg' } as CSSProperties} />
        <span className="sticker-dot right-[42%] top-12 h-6 w-6 bg-accent-cyan/65 floaty" style={{ '--rotate': '11deg' } as CSSProperties} />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="reveal-up">
            <span className="section-eyebrow">Parent Resource Hub</span>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl font-black leading-[0.9] tracking-tight text-neutral-text sm:text-6xl lg:text-7xl">
              Welcome to Allison&apos;s Classroom.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-neutral-dark-gray sm:text-xl">
              One warm, organized place for announcements, assignments, schedules, links, and classroom moments for Allison&apos;s 5th and 6th grade families.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/news" className="fun-button rounded-full bg-accent-cyan px-7 py-3.5 text-center font-black text-white shadow-xl shadow-cyan-200">See Latest News</Link>
              <Link href="/links" className="fun-button rounded-full border-2 border-neutral-medium-gray bg-white px-7 py-3.5 text-center font-black text-neutral-text shadow-sm hover:border-accent-pink">Open Parent Links</Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {['News', 'Work', 'Moments'].map((item, index) => (
                <div key={item} className="rounded-[1.25rem] border-2 border-white/80 bg-white/70 p-3 text-center shadow-sm backdrop-blur" style={{ transform: `rotate(${[-1.2, 1, -0.7][index]}deg)` }}>
                  <p className="font-serif text-2xl font-black text-neutral-text">{['📌', '🚀', '📸'][index]}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-neutral-dark-gray">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="chalkboard floaty-slow min-h-[420px] rounded-[2.2rem] p-5 text-white" style={{ '--rotate': '1deg' } as CSSProperties}>
            <div className="relative z-10 flex h-full flex-col rounded-[1.45rem] border-2 border-white/12 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="font-serif text-4xl font-black">Today in class</p>
                <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/85">live board</span>
              </div>
              <div className="grid flex-1 gap-4">
                <Link href="/news" className="drag-hint pop-card rounded-[1.4rem] bg-white/96 p-5 text-neutral-text shadow-lg" style={{ '--tilt': '-1.4deg', transform: 'rotate(-1.4deg)' } as CSSProperties}>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-accent-pink">Announcements</p>
                  <p className="mt-1 font-serif text-2xl font-black">Check here first for classroom updates.</p>
                </Link>
                <a href="#classes" className="drag-hint pop-card rounded-[1.4rem] bg-accent-yellow/95 p-5 text-neutral-text shadow-lg" style={{ '--tilt': '1.2deg', transform: 'rotate(1.2deg)' } as CSSProperties}>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-dark-gray">Assignments</p>
                  <p className="mt-1 font-serif text-2xl font-black">See what is due and where to find it.</p>
                </a>
                <Link href="/links" className="drag-hint pop-card rounded-[1.4rem] bg-accent-sky-blue/95 p-5 text-neutral-text shadow-lg" style={{ '--tilt': '-0.9deg', transform: 'rotate(-0.9deg)' } as CSSProperties}>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-dark-gray">Resources</p>
                  <p className="mt-1 font-serif text-2xl font-black">Google Classroom, gradebook, ClassDojo, and more.</p>
                </Link>
              </div>
              <div className="mt-5 h-3 w-40 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="section-eyebrow home-black-label">Quick Access</span>
            <h2 className="home-black-label mt-3 font-serif text-4xl font-black text-neutral-text">Family shortcuts</h2>
          </div>
        </div>
        <QuickLinkBar />
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="paper-card rounded-[2.2rem] p-6 sm:p-8">
          <div className="relative z-10 mb-6 flex items-center justify-between gap-4">
            <div>
              <span className="section-eyebrow">Bulletin Board</span>
              <h2 className="mt-3 font-serif text-4xl font-black text-neutral-text">Latest news</h2>
            </div>
            <Link href="/news" className="fun-button rounded-full bg-white px-4 py-2 text-sm font-black text-accent-cyan shadow-sm">View all →</Link>
          </div>
          <div className="relative z-10">
            {loading ? <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/80" />)}</div> : announcements.length > 0 ? <div className="space-y-4">{announcements.map(announcement => <AnnouncementCard key={announcement.id} announcement={announcement} />)}</div> : <EmptyState title="No announcements yet" body="Allison can add the first welcome note from the admin dashboard. Once posted, it will appear here automatically." cta="Go to News" href="/news" />}
          </div>
        </section>

        <section className="paper-card rounded-[2.2rem] p-6 sm:p-8">
          <div className="relative z-10 mb-6">
            <span className="section-eyebrow">Student Work</span>
            <h2 className="mt-3 font-serif text-4xl font-black text-neutral-text">Recent assignments</h2>
          </div>
          <div className="relative z-10">
            {loading ? <div className="grid gap-4">{[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-3xl bg-white/80" />)}</div> : assignments.length > 0 ? <div className="grid gap-4">{assignments.map(assignment => <AssignmentCard key={assignment.id} assignment={assignment} />)}</div> : <EmptyState title="No assignments posted" body="Assignments will show here after Allison adds them by class, due date, and resource link." cta="View Classes" href="#classes" />}
          </div>
        </section>
      </div>

      <section id="classes" className="mt-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-eyebrow home-black-label">Classrooms</span>
            <h2 className="home-black-label mt-3 font-serif text-5xl font-black leading-none text-neutral-text">Choose a class</h2>
          </div>
          <p className="max-w-xl text-sm font-bold leading-6 text-neutral-dark-gray">Each class page keeps families focused on the assignments and resources that match the student’s schedule.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-36 animate-pulse rounded-[1.6rem] bg-white/75" />)}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls, index) => (
              <Link key={cls.id} href={`/classes/${cls.slug}`} className="focus-ring bulletin-card pop-card group rounded-[1.8rem] p-6 pt-10" style={{ '--tilt': `${index % 2 === 0 ? -1.1 : 1.1}deg` } as CSSProperties}>
                <span className={`mb-5 block h-2 w-24 rounded-full ${classAccents[index % classAccents.length]}`} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-3xl font-black leading-tight text-neutral-text transition-colors group-hover:text-accent-cyan">{cls.display_name}</p>
                    <p className="mt-3 text-sm font-bold leading-6 text-neutral-dark-gray">Open announcements, assignments, and class-specific resources.</p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm transition-transform group-hover:rotate-6 group-hover:scale-110">{classEmoji[index % classEmoji.length]}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
