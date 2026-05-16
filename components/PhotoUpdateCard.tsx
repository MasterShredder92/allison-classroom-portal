import type { CSSProperties } from 'react'
import Image from 'next/image'

interface PhotoUpdate {
  id: string
  title?: string
  caption?: string
  image_url: string
  date: string
}

export default function PhotoUpdateCard({ photo }: { photo: PhotoUpdate }) {
  const formattedDate = new Date(photo.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="bulletin-card pop-card group overflow-hidden rounded-[1.9rem] bg-white pt-8" style={{ '--tilt': '1deg' } as CSSProperties}>
      <div className="relative z-10 mx-4 aspect-square overflow-hidden rounded-[1.35rem] bg-accent-lavender/20 shadow-inner">
        <Image src={photo.image_url} alt={photo.title || 'Classroom photo'} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="relative z-10 border-t-[6px] border-accent-lavender p-6">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-dark-gray">{formattedDate}</p>
        {photo.title && <h3 className="font-serif text-2xl font-black leading-tight text-neutral-text transition-colors group-hover:text-accent-cyan">{photo.title}</h3>}
        {photo.caption && <p className="mt-3 text-sm font-bold leading-6 text-neutral-dark-gray">{photo.caption}</p>}
      </div>
    </article>
  )
}
