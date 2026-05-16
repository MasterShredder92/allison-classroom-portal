"use client"
import { useEffect, useState } from 'react'

interface ScheduleItem {
  id: string
  day?: string
  time?: string
  title: string
  description?: string
}

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/schedule')
        if (res.ok) {
          const data = await res.json()
          setItems(data.data)
        }
      } catch (error) {
        console.error('Error fetching schedule:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSchedule()
  }, [])

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card notebook-lines rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Class Schedule</span>
          <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">Schedule</h1>
          <p className="mt-4 text-lg leading-8 text-neutral-dark-gray">A clean view of classroom timing, recurring blocks, and important schedule notes.</p>
        </div>
      </section>
      <section className="mt-8">
        {loading ? <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-[1.5rem] bg-white/80" />)}</div> : items.length > 0 ? <div className="space-y-4">{items.map(item => <div key={item.id} className="rounded-[1.5rem] border border-neutral-medium-gray/70 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-accent-cyan">{item.day || 'Schedule'} {item.time ? `• ${item.time}` : ''}</p><h2 className="mt-2 font-serif text-2xl font-black text-neutral-text">{item.title}</h2>{item.description && <p className="mt-3 leading-7 text-neutral-dark-gray">{item.description}</p>}</div>)}</div> : <div className="empty-state rounded-[2rem] p-10 text-center"><div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-lavender/25 text-3xl">🗓️</div><h2 className="font-serif text-3xl font-black text-neutral-text">No schedule items yet</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-dark-gray">Schedule details will appear here after they are added in the admin dashboard.</p></div>}
      </section>
    </div>
  )
}

