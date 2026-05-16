'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AssignmentCard from '@/components/AssignmentCard'

interface Class {
  id: string
  slug: string
  display_name: string
  grade: string
  subject: string
}

interface Assignment {
  id: string
  class_id: string
  title: string
  description: string
  due_date: string
  resource_type?: string
  resource_url?: string
  file_url?: string
}

export default function ClassPage() {
  const params = useParams()
  const slug = params.slug as string

  const [classInfo, setClassInfo] = useState<Class | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, assignmentsRes] = await Promise.all([
          fetch('/api/classes'),
          fetch(`/api/assignments?class_id=${slug}`),
        ])

        if (classesRes.ok) {
          const data = await classesRes.json()
          const foundClass = data.data.find((c: Class) => c.slug === slug)
          setClassInfo(foundClass || null)
        }

        if (assignmentsRes.ok) {
          const data = await assignmentsRes.json()
          const sorted = data.data.sort((a: any, b: any) =>
            new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
          )
          setAssignments(sorted)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-12 bg-neutral-light-gray rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-neutral-light-gray rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {classInfo ? (
        <>
          <div className="mb-12">
            <h1 className="font-serif text-4xl font-bold text-neutral-text mb-2">
              {classInfo.display_name}
            </h1>
            <p className="text-neutral-dark-gray text-lg">
              {classInfo.grade} Grade {classInfo.subject}
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold text-neutral-text mb-6">
              Assignments
            </h2>

            {assignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.map(assignment => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-neutral-light-gray rounded-lg">
                <p className="text-neutral-dark-gray">No assignments yet for this class.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-dark-gray text-lg">Class not found.</p>
        </div>
      )}
    </div>
  )
}
