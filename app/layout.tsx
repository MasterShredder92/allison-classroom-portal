import type { Metadata } from 'next'
import './globals.css'
import GlobalHeader from '@/components/GlobalHeader'

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
      <body className="bg-neutral-off-white text-neutral-text font-sans antialiased min-h-screen flex flex-col">
        <GlobalHeader />
        <main className="flex-1">{children}</main>
        <footer className="bg-neutral-light-gray border-t border-neutral-medium-gray mt-16 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-dark-gray text-sm">
            <p>© 2026 Allison's Classroom. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
