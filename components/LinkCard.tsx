import type { CSSProperties } from 'react'
import ResourcePreview from './ResourcePreview'

interface Link {
  id: string
  category: string
  title: string
  url: string
  description?: string
  audience?: string
}

const categoryColors: Record<string, string> = {
  gradebook: 'border-accent-yellow bg-accent-yellow/25',
  school: 'border-accent-sky-blue bg-accent-sky-blue/25',
  classroom_tools: 'border-accent-cyan bg-accent-cyan/18',
  reading: 'border-accent-lavender bg-accent-lavender/28',
  curriculum: 'border-accent-purple bg-accent-purple/22',
  other: 'border-accent-light-pink bg-accent-light-pink/28',
}

export default function LinkCard({ link }: { link: Link }) {
  const style = categoryColors[link.category] || categoryColors.other

  return (
    <article className={`bulletin-card pop-card rounded-[1.65rem] border-b-[6px] ${style} p-6 pt-9`} style={{ '--tilt': '-0.9deg' } as CSSProperties}>
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="focus-ring group block">
        <div className="relative z-10">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[1.2rem] bg-white text-2xl shadow-sm transition-transform group-hover:rotate-6 group-hover:scale-110">↗</div>
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-black text-accent-cyan shadow-sm transition-transform group-hover:translate-x-1">Open →</span>
          </div>
          <h3 className="font-serif text-2xl font-black leading-tight text-neutral-text transition-colors group-hover:text-accent-cyan">{link.title}</h3>
          {link.description && <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-neutral-dark-gray">{link.description}</p>}
          <div className="mt-5 flex items-center justify-between gap-3">
            {link.audience && <span className="rounded-full bg-white/76 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-neutral-dark-gray shadow-sm">{link.audience}</span>}
          </div>
        </div>
      </a>
      <div className="relative z-10 mt-5">
        <ResourcePreview url={link.url} title={link.title} compact />
      </div>
    </article>
  )
}
