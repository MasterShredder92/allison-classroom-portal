'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Login failed')
        return
      }

      router.push('/admin')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg border border-neutral-medium-gray">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-cyan rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-serif font-bold text-2xl">A</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-neutral-text">
              Admin Login
            </h1>
            <p className="text-neutral-dark-gray text-sm mt-2">
              Enter your credentials to manage the classroom portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                placeholder="allison@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-text mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-accent-pink/10 border border-accent-pink text-accent-pink text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-cyan text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-accent-cyan hover:underline text-sm">
              Back to portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
