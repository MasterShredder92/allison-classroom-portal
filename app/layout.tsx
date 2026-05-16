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
      <body className="text-neutral-text font-sans antialiased min-h-screen flex flex-col">
        <div className="rainbow-strip" />
        <GlobalHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <footer className="relative z-10 mt-20 border-t border-neutral-medium-gray/70 bg-white/65 backdrop-blur">
          <div className="classroom-shell py-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-neutral-dark-gray">
            <p className="font-semibold text-neutral-text">© 2026 Allison&apos;s Classroom</p>
            <div className="flex flex-col gap-2 sm:items-end">
              <p>Built for clear parent communication, assignments, schedules, and classroom updates.</p>
              <Link href="/admin/login" className="font-bold text-neutral-text underline decoration-accent-cyan/60 underline-offset-4 hover:text-accent-cyan">Teacher Login</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
