import type { Metadata } from 'next'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'

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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
