'use client'

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
          const sorted = data.data.sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">What's Happening</h1>
      <p className="text-neutral-dark-gray text-lg mb-8">
        Snapshots from our classroom activities and learning moments.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map(photo => (
            <PhotoUpdateCard key={photo.id} photo={photo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
          <p className="text-neutral-dark-gray text-lg">No photos yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
