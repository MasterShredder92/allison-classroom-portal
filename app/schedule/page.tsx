'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Schedule {
  id: string
  title?: string
  image_url: string
  notes?: string
  active: boolean
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/schedule')
        if (res.ok) {
          const data = await res.json()
          setSchedule(data.data)
        }
      } catch (error) {
        console.error('Error fetching schedule:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-12 bg-neutral-light-gray rounded mb-8 animate-pulse" />
        <div className="h-96 bg-neutral-light-gray rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-neutral-text mb-8">Class Schedule</h1>

      {schedule ? (
        <div className="space-y-6">
          {schedule.title && (
            <h2 className="font-serif text-2xl font-semibold text-neutral-text">
              {schedule.title}
            </h2>
          )}

          {schedule.image_url && (
            <div className="relative w-full aspect-auto bg-neutral-light-gray rounded-lg overflow-hidden border border-neutral-medium-gray">
              <Image
                src={schedule.image_url}
                alt="Class schedule"
                width={800}
                height={600}
                className="w-full h-auto object-contain p-4"
              />
            </div>
          )}

          {schedule.notes && (
            <div className="bg-accent-light-pink/20 border-l-4 border-accent-pink p-6 rounded">
              <p className="text-neutral-text leading-relaxed">
                {schedule.notes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
          <p className="text-neutral-dark-gray text-lg">Schedule not available yet.</p>
        </div>
      )}
    </div>
  )
}
