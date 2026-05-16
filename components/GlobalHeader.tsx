"use client"
import Link from 'next/link'
import { useState } from 'react'

const classes = [
  { name: '5th Grade English', slug: '5th-english' },
  { name: '6th Grade English', slug: '6th-english' },
  { name: '5th Grade Reading', slug: '5th-reading' },
  { name: '6th Grade Reading', slug: '6th-reading' },
  { name: '5th Grade Social Studies', slug: '5th-social-studies' },
  { name: '6th Grade Social Studies', slug: '6th-social-studies' },
]

export default function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [classesOpen, setClassesOpen] = useState(false)

  return (
    <header className="relative z-50 sticky top-0 border-b border-neutral-medium-gray/70 bg-white/78 shadow-[0_8px_26px_rgba(65,47,25,0.08)] backdrop-blur-xl">
      <nav className="classroom-shell h-20 flex items-center justify-between">
        <Link href="/" className="focus-ring group flex items-center gap-3 rounded-2xl">
          <div className="relative h-12 w-12 rounded-2xl bg-accent-cyan shadow-lg shadow-cyan-200/70 grid place-items-center rotate-[-3deg] group-hover:rotate-0 transition-transform">
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-accent-pink border-2 border-white" />
            <span className="font-serif text-white font-bold text-2xl">A</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="font-serif text-xl font-bold text-neutral-text">Allison&apos;s Classroom</p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-dark-gray">Wilmot 5th &amp; 6th Grade</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1 rounded-full border border-neutral-medium-gray/70 bg-white/70 p-1 shadow-sm">
          <Link href="/about" className="rounded-full px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-accent-light-pink/45 hover:text-neutral-text transition-colors">About</Link>
          <Link href="/news" className="rounded-full px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-accent-yellow/55 hover:text-neutral-text transition-colors">News</Link>
          <div className="relative group">
            <button className="rounded-full px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-accent-sky-blue/45 hover:text-neutral-text transition-colors flex items-center gap-1">
              Classes
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" /></svg>
            </button>
            <div className="absolute left-0 top-full mt-3 w-64 rounded-3xl border border-neutral-medium-gray/70 bg-white/95 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {classes.map((cls, index) => (
                <Link key={cls.slug} href={`/classes/${cls.slug}`} className="block rounded-2xl px-4 py-3 text-sm font-bold text-neutral-text hover:bg-neutral-off-white hover:text-accent-cyan transition-colors">
                  <span className="mr-2 text-xs text-neutral-dark-gray">0{index + 1}</span>{cls.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/links" className="rounded-full px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-accent-cyan/20 hover:text-neutral-text transition-colors">Links</Link>
          <Link href="/schedule" className="rounded-full px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-accent-lavender/45 hover:text-neutral-text transition-colors">Schedule</Link>
          <Link href="/whats-happening" className="rounded-full px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-accent-purple/35 hover:text-neutral-text transition-colors">What&apos;s Happening</Link>
          <Link href="/admin/login" className="rounded-full border border-neutral-medium-gray/80 bg-white px-4 py-2 text-sm font-black text-neutral-text shadow-sm hover:border-accent-cyan hover:bg-accent-cyan/10 transition-colors">Teacher Login</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring lg:hidden rounded-2xl border border-neutral-medium-gray/70 bg-white/80 p-3 shadow-sm" aria-label="Toggle navigation menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-neutral-medium-gray/70 bg-white/95 backdrop-blur-xl">
          <div className="classroom-shell py-4 space-y-2">
            <Link href="/about" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-bold hover:bg-neutral-off-white">About</Link>
            <Link href="/news" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-bold hover:bg-neutral-off-white">News</Link>
            <button onClick={() => setClassesOpen(!classesOpen)} className="w-full rounded-2xl px-4 py-3 text-left font-bold hover:bg-neutral-off-white flex items-center justify-between">
              Classes <span>{classesOpen ? '−' : '+'}</span>
            </button>
            {classesOpen && <div className="pl-4 grid gap-1">{classes.map(cls => <Link key={cls.slug} href={`/classes/${cls.slug}`} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-2 text-sm font-semibold text-neutral-dark-gray hover:bg-neutral-off-white">{cls.name}</Link>)}</div>}
            <Link href="/links" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-bold hover:bg-neutral-off-white">Links</Link>
            <Link href="/schedule" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-bold hover:bg-neutral-off-white">Schedule</Link>
            <Link href="/whats-happening" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-bold hover:bg-neutral-off-white">What&apos;s Happening</Link>
            <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="block rounded-2xl border border-neutral-medium-gray/80 bg-accent-cyan/10 px-4 py-3 font-black text-neutral-text hover:bg-accent-cyan/20">Teacher Login</Link>
          </div>
        </div>
      )}
    </header>
  )
}

