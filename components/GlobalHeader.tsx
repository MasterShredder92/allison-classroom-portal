"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

const classes = [
  { name: '5th Grade English', slug: '5th-english' },
  { name: '6th Grade English', slug: '6th-english' },
  { name: '5th Grade Reading', slug: '5th-reading' },
  { name: '6th Grade Reading', slug: '6th-reading' },
  { name: '5th Grade Social Studies', slug: '5th-social-studies' },
  { name: '6th Grade Social Studies', slug: '6th-social-studies' },
]

interface SitePage {
  slug: string
  title: string
}

function pageHref(page: SitePage) {
  if (page.slug === 'about' || page.slug === 'contact') return `/${page.slug}`
  return `/pages/${page.slug}`
}

export default function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [classesOpen, setClassesOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const [sitePages, setSitePages] = useState<SitePage[]>([])

  useEffect(() => {
    fetch('/api/page-content')
      .then(async res => {
        if (!res.ok) return []
        const payload = await res.json()
        return (payload.data || []) as SitePage[]
      })
      .then(pages => setSitePages(pages.filter(page => !['about', 'contact'].includes(page.slug))))
      .catch(() => setSitePages([]))
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b-2 border-neutral-medium-gray/60 bg-white/72 shadow-[0_14px_34px_rgba(65,47,25,0.10)] backdrop-blur-2xl">
      <nav className="classroom-shell flex min-h-16 items-center justify-between gap-3 py-2.5 sm:min-h-20 sm:gap-4 sm:py-3">
        <Link href="/" className="focus-ring group flex items-center gap-3 rounded-[1.35rem]">
          <div className="relative grid h-12 w-12 place-items-center rounded-[1.2rem] bg-accent-cyan shadow-lg shadow-cyan-200/70 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-[1.35rem]">
            <span className="absolute -left-1 -top-1 h-5 w-5 rounded-full border-2 border-white bg-accent-yellow" />
            <span className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-accent-pink" />
            <span className="font-serif text-3xl font-black leading-none text-white drop-shadow-sm">A</span>
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="font-serif text-2xl font-black tracking-tight text-neutral-text">Allison&apos;s Classroom</p>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.20em] text-neutral-dark-gray">Wilmot 5th &amp; 6th Grade</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border-2 border-neutral-medium-gray/60 bg-white/76 p-1.5 shadow-sm lg:flex">
          <Link href="/about" className="rounded-full px-4 py-2 text-sm font-black text-neutral-dark-gray transition-all hover:-translate-y-0.5 hover:bg-accent-light-pink/50 hover:text-neutral-text">About</Link>
          <Link href="/news" className="rounded-full px-4 py-2 text-sm font-black text-neutral-dark-gray transition-all hover:-translate-y-0.5 hover:bg-accent-yellow/60 hover:text-neutral-text">News</Link>
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-black text-neutral-dark-gray transition-all hover:-translate-y-0.5 hover:bg-accent-sky-blue/45 hover:text-neutral-text">
              Classes
              <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m6 9 6 6 6-6" /></svg>
            </button>
            <div className="invisible absolute left-0 top-full mt-4 w-72 translate-y-2 rounded-[1.6rem] border-2 border-neutral-medium-gray/70 bg-white/96 p-2.5 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {classes.map((cls, index) => (
                <Link key={cls.slug} href={`/classes/${cls.slug}`} className="group/item flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm font-black text-neutral-text transition-colors hover:bg-neutral-off-white hover:text-accent-cyan">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-yellow/70 text-[0.68rem] text-neutral-text transition-transform group-hover/item:rotate-6">0{index + 1}</span>{cls.name}
                </Link>
              ))}
            </div>
          </div>
          {sitePages.length > 0 && (
            <div className="group relative">
              <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-black text-neutral-dark-gray transition-all hover:-translate-y-0.5 hover:bg-accent-light-pink/45 hover:text-neutral-text">
                Pages
                <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className="invisible absolute left-0 top-full mt-4 w-72 translate-y-2 rounded-[1.6rem] border-2 border-neutral-medium-gray/70 bg-white/96 p-2.5 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {sitePages.map(page => (
                  <Link key={page.slug} href={pageHref(page)} className="block rounded-[1.1rem] px-4 py-3 text-sm font-black text-neutral-text transition-colors hover:bg-neutral-off-white hover:text-accent-cyan">
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link href="/links" className="rounded-full px-4 py-2 text-sm font-black text-neutral-dark-gray transition-all hover:-translate-y-0.5 hover:bg-accent-cyan/20 hover:text-neutral-text">Links</Link>
          <Link href="/schedule" className="rounded-full px-4 py-2 text-sm font-black text-neutral-dark-gray transition-all hover:-translate-y-0.5 hover:bg-accent-lavender/45 hover:text-neutral-text">Schedule</Link>
          <Link href="/whats-happening" className="rounded-full px-4 py-2 text-sm font-black text-neutral-dark-gray transition-all hover:-translate-y-0.5 hover:bg-accent-purple/35 hover:text-neutral-text">What&apos;s Happening</Link>
          <Link href="/admin/login" className="fun-button rounded-full border-2 border-neutral-text/10 bg-neutral-text px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-accent-cyan">Teacher Login</Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring lg:hidden rounded-[1.05rem] border-2 border-neutral-medium-gray/70 bg-white/86 p-2.5 shadow-sm transition hover:-translate-y-0.5" aria-label="Toggle navigation menu">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18 18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-nav-panel border-t-2 border-neutral-medium-gray/60 bg-white/96 backdrop-blur-xl lg:hidden">
          <div className="classroom-shell space-y-2 py-4">
            <Link href="/about" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-black hover:bg-neutral-off-white">About</Link>
            <Link href="/news" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-black hover:bg-neutral-off-white">News</Link>
            <button onClick={() => setClassesOpen(!classesOpen)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-black hover:bg-neutral-off-white">
              Classes <span>{classesOpen ? '−' : '+'}</span>
            </button>
            {classesOpen && <div className="grid gap-1 pl-4">{classes.map(cls => <Link key={cls.slug} href={`/classes/${cls.slug}`} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-neutral-off-white">{cls.name}</Link>)}</div>}
            {sitePages.length > 0 && (
              <>
                <button onClick={() => setPagesOpen(!pagesOpen)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-black hover:bg-neutral-off-white">
                  Pages <span>{pagesOpen ? '−' : '+'}</span>
                </button>
                {pagesOpen && <div className="grid gap-1 pl-4">{sitePages.map(page => <Link key={page.slug} href={pageHref(page)} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-2 text-sm font-bold text-neutral-dark-gray hover:bg-neutral-off-white">{page.title}</Link>)}</div>}
              </>
            )}
            <Link href="/links" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-black hover:bg-neutral-off-white">Links</Link>
            <Link href="/schedule" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-black hover:bg-neutral-off-white">Schedule</Link>
            <Link href="/whats-happening" onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-black hover:bg-neutral-off-white">What&apos;s Happening</Link>
            <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="block rounded-2xl border-2 border-neutral-medium-gray/80 bg-accent-cyan/12 px-4 py-3 font-black text-neutral-text hover:bg-accent-cyan/20">Teacher Login</Link>
          </div>
        </div>
      )}
    </header>
  )
}
