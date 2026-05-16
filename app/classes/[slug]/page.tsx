"use client"
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
  class_name?: string
  title: string
  description?: string
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
        const [classesRes, assignmentsRes] = await Promise.all([fetch('/api/classes'), fetch(`/api/assignments?class_id=${slug}`)])
        if (classesRes.ok) {
          const data = await classesRes.json()
          const foundClass = data.data.find((c: Class) => c.slug === slug)
          setClassInfo(foundClass || null)
        }
        if (assignmentsRes.ok) {
          const data = await assignmentsRes.json()
          const sorted = data.data.sort((a: Assignment, b: Assignment) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
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
    return <div className="classroom-shell py-12"><div className="h-52 animate-pulse rounded-[2rem] bg-white/80" /><div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-36 animate-pulse rounded-[1.5rem] bg-white/80" />)}</div></div>
  }

  return (
    <div className="classroom-shell py-10 sm:py-14">
      {classInfo ? (
        <>
          <section className="paper-card rounded-[2rem] p-8 sm:p-10">
            <div className="relative z-10 max-w-3xl">
              <span className="section-eyebrow">{classInfo.grade} Grade</span>
              <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">{classInfo.display_name}</h1>
              <p className="mt-4 text-lg leading-8 text-neutral-dark-gray">Assignments and resources for {classInfo.subject}. This page keeps the class-specific work easy for families to find.</p>
            </div>
          </section>
          <section className="mt-8">
            <h2 className="mb-5 font-serif text-3xl font-black text-neutral-text">Assignments</h2>
            {assignments.length > 0 ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{assignments.map(assignment => <AssignmentCard key={assignment.id} assignment={assignment} />)}</div> : <div className="empty-state rounded-[2rem] p-10 text-center"><div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-yellow/35 text-3xl">📝</div><h3 className="font-serif text-3xl font-black text-neutral-text">No assignments yet</h3><p className="mx-auto mt-3 max-w-xl leading-7 text-neutral-dark-gray">Assignments for this class will appear here after Allison posts them.</p></div>}
          </section>
        </>
      ) : (
        <div className="empty-state rounded-[2rem] p-10 text-center"><h1 className="font-serif text-4xl font-black text-neutral-text">Class not found</h1><p className="mt-3 text-neutral-dark-gray">This class page is not available.</p></div>
      )}
    </div>
  )
}

