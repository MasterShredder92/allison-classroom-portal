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
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-neutral-medium-gray/70 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute inset-y-0 left-0 w-2 bg-accent-pink" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-accent-pink">{formattedDate}</p>
          <h3 className="font-serif text-2xl font-black leading-tight text-neutral-text">{announcement.title}</h3>
        </div>
        {announcement.pinned && <span className="rounded-full bg-accent-pink px-3 py-1 text-xs font-black text-white shadow-sm">Pinned</span>}
      </div>
      <p className="mt-4 leading-7 text-neutral-dark-gray">{announcement.body}</p>
      {(announcement.attachment_url || announcement.link_url) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {announcement.attachment_url && <a href={announcement.attachment_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-accent-light-pink/55 px-4 py-2 text-sm font-black text-neutral-text hover:bg-accent-light-pink">Attachment</a>}
          {announcement.link_url && <a href={announcement.link_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-accent-cyan px-4 py-2 text-sm font-black text-white hover:opacity-90">Open link →</a>}
        </div>
      )}
    </article>
  )
}

