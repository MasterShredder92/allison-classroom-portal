'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (isLoginPage) {
      return
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken')

        if (!token) {
          router.push('/admin/login')
          return
        }

        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem('adminToken')
          router.push('/admin/login')
          return
        }

        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-off-white">
        <div className="text-center">
          <div className="w-12 h-12 bg-accent-cyan rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-dark-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-off-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-neutral-light-gray border-b md:border-r md:border-b-0 border-neutral-medium-gray md:w-64 md:min-h-screen">
        <div className="sticky top-0 p-6 md:p-4">
          <div className="flex items-center justify-between md:block">
            <div className="space-y-3">
              <Link href="/admin" className="block font-serif text-xl font-bold text-neutral-text">
                Admin
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-full border-2 border-accent-sky-blue/35 bg-accent-sky-blue/18 px-4 py-2 text-sm font-black text-neutral-text shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-sky-blue/28">
                🏫 Main Site
              </Link>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden rounded p-2 hover:bg-neutral-medium-gray"
              aria-label="Toggle admin navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="block md:hidden px-6 pb-6 space-y-2">
            <Link
              href="/admin"
              className="block py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/schedule"
              className="block py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
            >
              Schedule
            </Link>
            <Link
              href="/admin/edit-site"
              className="block py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
            >
              Edit Site
            </Link>
            <hr className="my-4" />
            <button
              onClick={() => {
                localStorage.removeItem('adminToken')
                router.push('/admin/login')
              }}
              className="w-full text-left py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
            >
              Logout
            </button>
          </nav>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:block px-4 py-4 space-y-2">
          <Link
            href="/admin"
            className="block py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/schedule"
            className="block py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
          >
            Schedule
          </Link>
          <Link
            href="/admin/edit-site"
            className="block py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
          >
            Edit Site
          </Link>
          <hr className="my-4" />
          <button
            onClick={() => {
              localStorage.removeItem('adminToken')
              router.push('/admin/login')
            }}
            className="w-full text-left py-2 px-4 rounded text-neutral-text hover:bg-neutral-medium-gray transition-colors"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8" dir="ltr">{children}</main>
    </div>
  )
}
