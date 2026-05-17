import Link from 'next/link'
import { notFound } from 'next/navigation'
import RichContent from '@/components/RichContent'
import { createPublicSupabaseClient } from '@/lib/supabase/server'

interface PageContent {
  slug: string
  title: string
  body_markdown?: string | null
}

type PageProps = {
  params: Promise<{ slug: string }>
}

async function getPage(slug: string): Promise<PageContent | null> {
  const supabase = createPublicSupabaseClient()
  const { data, error } = await supabase
    .from('page_content')
    .select('slug,title,body_markdown')
    .eq('slug', slug)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) notFound()

  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card notebook-lines rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Classroom Page</span>
          <h1 className="mt-4 font-serif text-5xl font-black leading-none tracking-tight text-neutral-text sm:text-6xl">{page.title}</h1>
        </div>
      </section>

      <section className="paper-card mt-8 rounded-[2rem] p-8 sm:p-10">
        <RichContent html={page.body_markdown} />
      </section>

      <Link href="/" className="mt-8 inline-flex rounded-xl bg-accent-cyan px-5 py-3 font-black text-white hover:opacity-90">
        Back to Home
      </Link>
    </div>
  )
}
