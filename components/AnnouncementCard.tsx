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
    <div className="bg-neutral-light-gray rounded-lg p-6 border-l-4 border-accent-pink hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-serif text-xl font-semibold text-neutral-text flex-1">
          {announcement.title}
        </h3>
        {announcement.pinned && (
          <span className="bg-accent-pink text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
            Pinned
          </span>
        )}
      </div>

      <p className="text-neutral-dark-gray text-sm mb-3">{formattedDate}</p>

      <p className="text-neutral-text leading-relaxed mb-4">{announcement.body}</p>

      {(announcement.attachment_url || announcement.link_url) && (
        <div className="flex gap-2">
          {announcement.attachment_url && (
            <a
              href={announcement.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline text-sm font-semibold"
            >
              📎 Attachment
            </a>
          )}
          {announcement.link_url && (
            <a
              href={announcement.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline text-sm font-semibold"
            >
              🔗 Link
            </a>
          )}
        </div>
      )}
    </div>
  )
}
