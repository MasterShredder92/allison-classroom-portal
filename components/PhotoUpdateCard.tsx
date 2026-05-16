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
    <div className="bg-neutral-light-gray rounded-lg overflow-hidden border-l-4 border-accent-lavender hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-square">
        <Image
          src={photo.image_url}
          alt={photo.title || 'Classroom photo'}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6">
        {photo.title && (
          <h3 className="font-serif text-lg font-semibold text-neutral-text mb-2">
            {photo.title}
          </h3>
        )}

        {photo.caption && (
          <p className="text-neutral-text text-sm mb-3 leading-relaxed">
            {photo.caption}
          </p>
        )}

        <p className="text-neutral-dark-gray text-xs">{formattedDate}</p>
      </div>
    </div>
  )
}
