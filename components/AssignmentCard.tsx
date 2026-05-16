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
    <article className="relative overflow-hidden rounded-[1.5rem] border border-neutral-medium-gray/70 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute inset-y-0 left-0 w-2 bg-accent-cyan" />
      {assignment.class_name && <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-accent-cyan">{assignment.class_name}</p>}
      <h3 className="font-serif text-xl font-black leading-tight text-neutral-text">{assignment.title}</h3>
      {assignment.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-dark-gray">{assignment.description}</p>}
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full bg-neutral-off-white px-3 py-2 text-sm font-black text-neutral-dark-gray">
          <span>📅</span>
          <span className={isDueToday ? 'text-accent-pink' : isOverdue ? 'line-through' : ''}>{formattedDate}</span>
        </div>
        {isDueToday && <span className="rounded-full bg-accent-pink px-3 py-1 text-xs font-black text-white">Today</span>}
        {isOverdue && <span className="rounded-full bg-neutral-medium-gray px-3 py-1 text-xs font-black text-neutral-dark-gray">Past Due</span>}
      </div>
      {(assignment.resource_url || assignment.file_url) && <a href={assignment.resource_url || assignment.file_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-accent-cyan px-4 py-2 text-sm font-black text-white shadow-sm hover:opacity-90">Open resource →</a>}
    </article>
  )
}

