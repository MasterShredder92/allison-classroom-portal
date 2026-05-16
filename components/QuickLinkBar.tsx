export default function QuickLinkBar() {
  const quickLinks = [
    {
      icon: '📚',
      title: 'Google Classroom',
      url: 'https://classroom.google.com',
      color: 'border-accent-sky-blue',
    },
    {
      icon: '📊',
      title: 'Gradebook',
      url: 'https://classroom.google.com',
      color: 'border-accent-yellow',
    },
    {
      icon: '🎮',
      title: 'ClassDojo',
      url: 'https://www.classdojo.com',
      color: 'border-accent-purple',
    },
    {
      icon: '🏫',
      title: 'School Site',
      url: 'https://www.wilmot54-7.com',
      color: 'border-accent-lavender',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickLinks.map((link) => (
        <a
          key={link.title}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-neutral-light-gray p-4 rounded-lg border-b-4 ${link.color} hover:shadow-md transition-shadow text-center`}
        >
          <div className="text-3xl mb-2">{link.icon}</div>
          <p className="text-sm font-semibold text-neutral-text">{link.title}</p>
        </a>
      ))}
    </div>
  )
}
