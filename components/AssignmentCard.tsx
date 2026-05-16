interface Assignment {
  id: string
  class_id: string
  title: string
  description: string
  due_date: string
  resource_type?: string
  resource_url?: string
  file_url?: string
  class_name?: string
}

export default function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const dueDate = new Date(assignment.due_date)
  const today = new Date()
  const isOverdue = dueDate < today && dueDate.toDateString() !== today.toDateString()
  const isDueToday = dueDate.toDateString() === today.toDateString()

  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-neutral-light-gray rounded-lg p-6 border-l-4 border-accent-cyan hover:shadow-md transition-shadow">
      {assignment.class_name && (
        <p className="text-accent-cyan text-xs font-semibold uppercase tracking-wide mb-2">
          {assignment.class_name}
        </p>
      )}

      <h3 className="font-serif text-lg font-semibold text-neutral-text mb-2">
        {assignment.title}
      </h3>

      {assignment.description && (
        <p className="text-neutral-dark-gray text-sm mb-4 line-clamp-2">
          {assignment.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className={`text-sm font-semibold ${isDueToday ? 'text-accent-pink' : isOverdue ? 'text-neutral-dark-gray line-through' : 'text-neutral-dark-gray'}`}>
            {formattedDate}
          </span>
        </div>
        {isDueToday && <span className="bg-accent-pink text-white text-xs font-bold px-2 py-1 rounded">Today</span>}
        {isOverdue && <span className="bg-neutral-medium-gray text-neutral-dark-gray text-xs font-bold px-2 py-1 rounded">Past Due</span>}
      </div>

      {(assignment.resource_url || assignment.file_url) && (
        <a
          href={assignment.resource_url || assignment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent-cyan text-white px-4 py-2 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          View Assignment
        </a>
      )}
    </div>
  )
}
