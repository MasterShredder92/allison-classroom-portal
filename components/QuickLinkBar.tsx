import type { CSSProperties } from 'react'

const quickLinks = [
  { icon: '📚', title: 'Google Classroom', note: 'Daily classwork', url: 'https://classroom.google.com', color: 'from-accent-sky-blue/55 to-white', border: 'border-accent-sky-blue', rotate: '-1.3deg' },
  { icon: '📊', title: 'Gradebook', note: 'Check progress', url: 'https://classroom.google.com', color: 'from-accent-yellow/60 to-white', border: 'border-accent-yellow', rotate: '1.1deg' },
  { icon: '🎮', title: 'ClassDojo', note: 'Class updates', url: 'https://www.classdojo.com', color: 'from-accent-purple/40 to-white', border: 'border-accent-purple', rotate: '-0.8deg' },
  { icon: '🏫', title: 'School Site', note: 'Wilmot resources', url: 'https://www.wilmot.k12.sd.us/', color: 'from-accent-lavender/50 to-white', border: 'border-accent-lavender', rotate: '1.4deg' },
]

export default function QuickLinkBar() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {quickLinks.map((link) => (
        <a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer" className={`focus-ring group paper-card pop-card drag-hint overflow-hidden rounded-[1.8rem] border-b-[6px] ${link.border} bg-gradient-to-br ${link.color} p-5`} style={{ '--tilt': link.rotate } as CSSProperties}>
          <div className="tape left-7 top-[-4px] rotate-[-5deg]" />
          <div className="relative z-10 flex min-h-32 flex-col justify-between gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-white text-3xl shadow-sm transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">{link.icon}</div>
              <span className="quick-arrow-badge rounded-full px-3.5 py-2 text-base font-black transition-transform group-hover:translate-x-1 group-hover:-rotate-6">→</span>
            </div>
            <div>
              <p className="font-serif text-2xl font-black leading-none text-neutral-text">{link.title}</p>
              <p className="mt-2 text-sm font-bold text-neutral-dark-gray">{link.note}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
