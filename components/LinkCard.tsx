interface Link {
  id: string
  category: string
  title: string
  url: string
  description?: string
  audience?: string
}

const categoryColors: Record<string, string> = {
  gradebook: 'border-accent-yellow bg-accent-yellow/20',
  school: 'border-accent-sky-blue bg-accent-sky-blue/20',
  classroom_tools: 'border-accent-cyan bg-accent-cyan/15',
  reading: 'border-accent-lavender bg-accent-lavender/25',
  curriculum: 'border-accent-purple bg-accent-purple/20',
  other: 'border-accent-light-pink bg-accent-light-pink/25',
}

export default function LinkCard({ link }: { link: Link }) {
  const style = categoryColors[link.category] || categoryColors.other
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={`focus-ring group block rounded-[1.5rem] border-b-4 ${style} p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl shadow-sm">↗</div>
      <h3 className="font-serif text-xl font-black text-neutral-text transition-colors group-hover:text-accent-cyan">{link.title}</h3>
      {link.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-dark-gray">{link.description}</p>}
      <div className="mt-5 flex items-center justify-between gap-3">
        {link.audience && <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-neutral-dark-gray">{link.audience}</span>}
        <span className="ml-auto text-sm font-black text-accent-cyan transition-transform group-hover:translate-x-1">Open →</span>
      </div>
    </a>
  )
}

