import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySegments, getPages, slugToHref, slugToSegments } from '@/lib/cms'
import { AutoRender } from '@/components/Content'

// Required for `output: 'export'`: only pre-rendered paths exist.
export const dynamicParams = false

export function generateStaticParams() {
  const params = getPages().map((p) => ({ slug: slugToSegments(p.slug) }))
  // Always emit "/" — shows a page index if no page has the slug "home".
  if (!params.some((p) => p.slug.length === 0)) params.push({ slug: [] })
  return params
}

type Props = { params: Promise<{ slug?: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPageBySegments((await params).slug)
  if (!page) return {}
  const fallback = typeof page.title === 'string' ? page.title : page.slug
  return {
    title: page.meta?.title ?? fallback,
    description: page.meta?.description,
    openGraph: page.meta?.image ? { images: [page.meta.image.url] } : undefined,
  }
}

// Server component: runs at build time, reads the baked-in JSON.
export default async function Page({ params }: Props) {
  const segments = (await params).slug ?? []
  const page = getPageBySegments(segments)

  if (!page) {
    if (segments.length) notFound()
    return (
      <nav>
        <h1>Pages</h1>
        <ul>
          {getPages().map((p) => (
            <li key={p.id}><a href={slugToHref(p.slug)}>{p.slug}</a></li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <article>
      <AutoRender data={page} />
    </article>
  )
}
