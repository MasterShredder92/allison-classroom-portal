import type { Metadata } from 'next'
import './globals.css'
import GlobalHeader from '@/components/GlobalHeader'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Allison's Classroom Portal",
  description: 'Parent resource hub for Allison\'s 5th and 6th grade classes at Wilmot Public School.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans text-neutral-text antialiased">
        <div className="rainbow-strip relative z-20" />
        <GlobalHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <footer className="relative z-10 mt-20 border-t-2 border-neutral-medium-gray/60 bg-white/70 backdrop-blur-xl">
          <div className="classroom-shell py-8">
            <div className="paper-card flex flex-col gap-5 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative z-10">
                <p className="font-serif text-2xl font-black text-neutral-text">© 2026 Allison&apos;s Classroom</p>
                <p className="mt-1 max-w-2xl text-sm font-bold leading-6 text-neutral-dark-gray">Built for clear parent communication, assignments, schedules, and classroom updates.</p>
              </div>
              <Link href="/admin/login" className="fun-button relative z-10 rounded-full bg-neutral-text px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-accent-cyan">Teacher Login</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
