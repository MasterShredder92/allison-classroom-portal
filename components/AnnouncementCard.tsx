import type { CSSProperties } from 'react'

interface Announcement {
  id: string
  title: string
  body: string
  date: string
  pinned?: boolean
  attachment_url?: string
  link_url?: string
}

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const formattedDate = new Date(announcement.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="bulletin-card pop-card group rounded-[1.65rem] p-5 pt-9" style={{ '--tilt': '-0.8deg' } as CSSProperties}>
      <div className="absolute left-0 top-0 h-full w-2 bg-accent-pink" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-yellow/60 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-neutral-text">{formattedDate}</span>
            {announcement.pinned && <span className="rounded-full bg-accent-pink/18 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-accent-pink">Pinned</span>}
          </div>
          <h3 className="font-serif text-2xl font-black leading-tight text-neutral-text transition-colors group-hover:text-accent-cyan">{announcement.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm font-bold leading-6 text-neutral-dark-gray">{announcement.body}</p>
        </div>
        {(announcement.attachment_url || announcement.link_url) && (
          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
            {announcement.attachment_url && <a href={announcement.attachment_url} target="_blank" rel="noopener noreferrer" className="fun-button rounded-full border-2 border-neutral-medium-gray bg-white px-4 py-2 text-xs font-black text-neutral-text shadow-sm">Attachment</a>}
            {announcement.link_url && <a href={announcement.link_url} target="_blank" rel="noopener noreferrer" className="fun-button rounded-full bg-accent-cyan px-4 py-2 text-xs font-black text-white shadow-sm">Open link →</a>}
          </div>
        )}
      </div>
    </article>
  )
}
