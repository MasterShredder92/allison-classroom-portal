"use client"
import { useEffect, useState } from 'react'
import PhotoUpdateCard from '@/components/PhotoUpdateCard'

interface PhotoUpdate {
  id: string
  title?: string
  caption?: string
  image_url: string
  date: string
}

export default function WhatsHappeningPage() {
  const [photos, setPhotos] = useState<PhotoUpdate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/photo-updates')
        if (res.ok) {
          const data = await res.json()
          const sorted = data.data.sort((a: PhotoUpdate, b: PhotoUpdate) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setPhotos(sorted)
        }
      } catch (error) {
        console.error('Error fetching photos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [])

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Classroom Moments</span>
          <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">What&apos;s happening</h1>
          <p className="mt-4 text-lg leading-8 text-neutral-dark-gray">Snapshots from classroom activities, projects, reading moments, and the work students are proud to share.</p>
        </div>
      </section>

      <section className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 animate-pulse rounded-[1.7rem] bg-white/80" />)}</div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{photos.map(photo => <PhotoUpdateCard key={photo.id} photo={photo} />)}</div>
        ) : (
          <div className="empty-state rounded-[2rem] p-10 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-purple/20 text-3xl">📸</div>
            <h2 className="font-serif text-3xl font-black text-neutral-text">No photos yet</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-dark-gray">When Allison adds classroom photos, this page becomes the visual classroom board for families.</p>
          </div>
        )}
      </section>
    </div>
  )
}

