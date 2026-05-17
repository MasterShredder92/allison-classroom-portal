import type { CSSProperties } from 'react'

const quickLinks = [
  { icon: '📚', title: 'Google Classroom', note: 'Daily classwork', url: 'https://classroom.google.com', color: 'from-accent-sky-blue/45 via-white/80 to-accent-light-pink/35', border: 'border-accent-sky-blue', rotate: '-1.3deg' },
  { icon: '📊', title: 'Gradebook', note: 'Check progress', url: 'https://classroom.google.com', color: 'from-accent-light-pink/48 via-white/80 to-accent-sky-blue/30', border: 'border-accent-light-pink', rotate: '1.1deg' },
  { icon: '🎮', title: 'ClassDojo', note: 'Class updates', url: 'https://www.classdojo.com', color: 'from-accent-sky-blue/38 via-white/80 to-accent-pink/24', border: 'border-accent-sky-blue', rotate: '-0.8deg' },
  { icon: '🏫', title: 'School Site', note: 'Wilmot resources', url: 'https://www.wilmot.k12.sd.us/', color: 'from-accent-light-pink/42 via-white/80 to-accent-sky-blue/34', border: 'border-accent-light-pink', rotate: '1.4deg' },
]

export default function QuickLinkBar() {
  return (
    <div className="quick-link-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {quickLinks.map((link) => (
        <a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer" className={`focus-ring group quick-link-card paper-card pop-card drag-hint overflow-hidden rounded-[1.55rem] border-b-[5px] ${link.border} bg-gradient-to-br ${link.color} p-4 sm:p-5`} style={{ '--tilt': link.rotate } as CSSProperties}>
          <div className="tape left-7 top-[-4px] rotate-[-5deg]" />
          <div className="relative z-10 flex min-h-28 flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="quick-link-icon grid h-12 w-12 place-items-center rounded-[1.15rem] bg-white text-3xl shadow-sm transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">{link.icon}</div>
              <span className="quick-arrow-badge rounded-full px-3.5 py-2 text-base font-black transition-transform group-hover:translate-x-1 group-hover:-rotate-6">→</span>
            </div>
            <div>
              <p className="font-serif text-[1.35rem] font-black leading-none text-neutral-text sm:text-2xl">{link.title}</p>
              <p className="mt-2 text-sm font-bold text-neutral-dark-gray">{link.note}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
