interface Link {
  id: string
  category: string
  title: string
  url: string
  description?: string
  audience?: string
}

const categoryColors: Record<string, string> = {
  gradebook: 'border-accent-yellow',
  school: 'border-accent-sky-blue',
  classroom_tools: 'border-accent-cyan',
  reading: 'border-accent-lavender',
  curriculum: 'border-accent-purple',
  other: 'border-accent-light-pink',
}

export default function LinkCard({ link }: { link: Link }) {
  const borderColor = categoryColors[link.category] || categoryColors.other

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-neutral-light-gray p-6 rounded-lg border-b-4 ${borderColor} hover:shadow-lg transition-shadow block group`}
    >
      <h3 className="font-serif text-lg font-semibold text-neutral-text group-hover:text-accent-cyan transition-colors mb-2">
        {link.title}
      </h3>

      {link.description && (
        <p className="text-neutral-dark-gray text-sm mb-3 line-clamp-2">
          {link.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        {link.audience && (
          <span className="text-xs font-semibold text-neutral-dark-gray uppercase tracking-wide">
            {link.audience}
          </span>
        )}
        <span className="text-accent-cyan font-semibold text-sm group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </a>
  )
}
