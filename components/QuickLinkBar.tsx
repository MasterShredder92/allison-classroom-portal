const quickLinks = [
  { icon: '📚', title: 'Google Classroom', note: 'Daily classwork', url: 'https://classroom.google.com', color: 'from-accent-sky-blue/45 to-white', border: 'border-accent-sky-blue' },
  { icon: '📊', title: 'Gradebook', note: 'Check progress', url: 'https://classroom.google.com', color: 'from-accent-yellow/50 to-white', border: 'border-accent-yellow' },
  { icon: '🎮', title: 'ClassDojo', note: 'Class updates', url: 'https://www.classdojo.com', color: 'from-accent-purple/35 to-white', border: 'border-accent-purple' },
  { icon: '🏫', title: 'School Site', note: 'Wilmot resources', url: 'https://www.wilmot.k12.sd.us/', color: 'from-accent-lavender/45 to-white', border: 'border-accent-lavender' },
]

export default function QuickLinkBar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickLinks.map((link) => (
        <a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer" className={`focus-ring group paper-card overflow-hidden rounded-[1.6rem] border-b-4 ${link.border} bg-gradient-to-br ${link.color} p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl`}>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm text-2xl group-hover:scale-110 transition-transform">{link.icon}</div>
              <p className="font-serif text-lg font-bold text-neutral-text">{link.title}</p>
              <p className="mt-1 text-sm font-semibold text-neutral-dark-gray">{link.note}</p>
            </div>
            <span className="mt-2 rounded-full bg-white/80 px-3 py-1 text-sm font-black text-neutral-text transition-transform group-hover:translate-x-1">→</span>
          </div>
        </a>
      ))}
    </div>
  )
}

