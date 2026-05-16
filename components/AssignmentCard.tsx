import type { CSSProperties } from 'react'
import ResourcePreview from './ResourcePreview'

interface Assignment {
  id: string
  class_name?: string
  title: string
  description?: string
  due_date: string
  resource_type?: string
  resource_url?: string
  file_url?: string
}

export default function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const dueDate = new Date(assignment.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  const isDueToday = dueDate.getTime() === today.getTime()
  const isOverdue = dueDate < today
  const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <article className="bulletin-card pop-card group rounded-[1.55rem] p-5 pt-8" style={{ '--tilt': '0.8deg' } as CSSProperties}>
      <div className="absolute left-0 top-0 h-full w-2 bg-accent-cyan" />
      <div className="relative z-10">
        {assignment.class_name && <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-accent-cyan">{assignment.class_name}</p>}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-2xl font-black leading-tight text-neutral-text transition-colors group-hover:text-accent-cyan">{assignment.title}</h3>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent-yellow/55 shadow-sm">✏️</span>
        </div>
        {assignment.description && <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-neutral-dark-gray">{assignment.description}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-neutral-off-white px-3 py-2 text-sm font-black text-neutral-dark-gray shadow-inner">
            <span>📅</span>
            <span className={isDueToday ? 'text-accent-pink' : isOverdue ? 'line-through' : ''}>{formattedDate}</span>
          </div>
          {isDueToday && <span className="rounded-full bg-accent-pink px-3 py-1 text-xs font-black text-white">Today</span>}
          {isOverdue && <span className="rounded-full bg-neutral-medium-gray px-3 py-1 text-xs font-black text-neutral-dark-gray">Past Due</span>}
        </div>
        {(assignment.resource_url || assignment.file_url) && (
          <div className="mt-5">
            <ResourcePreview url={assignment.resource_url || assignment.file_url} title={assignment.title} compact />
          </div>
        )}
      </div>
    </article>
  )
}
