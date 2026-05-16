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
    <article className="overflow-hidden rounded-[1.7rem] border border-neutral-medium-gray/70 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative w-full aspect-square bg-accent-lavender/20">
        <Image src={photo.image_url} alt={photo.title || 'Classroom photo'} fill className="object-cover" />
      </div>
      <div className="border-t-4 border-accent-lavender p-6">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-dark-gray">{formattedDate}</p>
        {photo.title && <h3 className="font-serif text-xl font-black text-neutral-text">{photo.title}</h3>}
        {photo.caption && <p className="mt-3 text-sm leading-6 text-neutral-dark-gray">{photo.caption}</p>}
      </div>
    </article>
  )
}

