'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [classesOpen, setClassesOpen] = useState(false)

  const classes = [
    { slug: '5th-english', name: '5th Grade English' },
    { slug: '6th-english', name: '6th Grade English' },
    { slug: '5th-reading', name: '5th Grade Reading' },
    { slug: '6th-reading', name: '6th Grade Reading' },
    { slug: '5th-social-studies', name: '5th Grade Social Studies' },
    { slug: '6th-social-studies', name: '6th Grade Social Studies' },
  ]

  return (
    <header className="bg-neutral-off-white border-b border-neutral-medium-gray shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent-cyan rounded-lg flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">A</span>
          </div>
          <span className="hidden sm:inline font-serif text-lg font-semibold text-neutral-text">
            Allison's Classroom
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-neutral-text hover:text-accent-cyan transition-colors">
            About
          </Link>
          <Link href="/news" className="text-neutral-text hover:text-accent-cyan transition-colors">
            News
          </Link>

          {/* Classes Dropdown */}
          <div className="relative group">
            <button className="text-neutral-text hover:text-accent-cyan transition-colors flex items-center gap-1">
              Classes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-white border border-neutral-medium-gray rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {classes.map(cls => (
                <Link
                  key={cls.slug}
                  href={`/classes/${cls.slug}`}
                  className="block px-4 py-2 text-sm text-neutral-text hover:bg-neutral-light-gray hover:text-accent-cyan first:rounded-t-lg last:rounded-b-lg"
                >
                  {cls.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/links" className="text-neutral-text hover:text-accent-cyan transition-colors">
            Links
          </Link>
          <Link href="/schedule" className="text-neutral-text hover:text-accent-cyan transition-colors">
            Schedule
          </Link>
          <Link href="/whats-happening" className="text-neutral-text hover:text-accent-cyan transition-colors">
            What's Happening
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-neutral-light-gray rounded transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-medium-gray bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/about" className="block py-2 text-neutral-text hover:text-accent-cyan">
              About
            </Link>
            <Link href="/news" className="block py-2 text-neutral-text hover:text-accent-cyan">
              News
            </Link>

            {/* Mobile Classes */}
            <div>
              <button
                onClick={() => setClassesOpen(!classesOpen)}
                className="w-full text-left py-2 text-neutral-text hover:text-accent-cyan flex items-center justify-between"
              >
                Classes
                <svg className={`w-4 h-4 transition-transform ${classesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              {classesOpen && (
                <div className="pl-4 space-y-1 mt-1">
                  {classes.map(cls => (
                    <Link
                      key={cls.slug}
                      href={`/classes/${cls.slug}`}
                      className="block py-2 text-sm text-neutral-dark-gray hover:text-accent-cyan"
                      onClick={() => setMenuOpen(false)}
                    >
                      {cls.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/links" className="block py-2 text-neutral-text hover:text-accent-cyan">
              Links
            </Link>
            <Link href="/schedule" className="block py-2 text-neutral-text hover:text-accent-cyan">
              Schedule
            </Link>
            <Link href="/whats-happening" className="block py-2 text-neutral-text hover:text-accent-cyan">
              What's Happening
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
