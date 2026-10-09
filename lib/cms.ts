import fs from 'node:fs'
import path from 'node:path'

// Pages are schema-agnostic on purpose: <AutoRender> walks whatever fields exist.
export type MediaDoc = {
  id?: string | number
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string
  sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null }>
}

export type Page = {
  id: string | number
  slug: string
  meta?: { title?: string; description?: string; image?: MediaDoc | null }
  [field: string]: any
}

let cache: Page[] | null = null

/** Reads the JSON written by scripts/sync-cms.mjs. No network involved. */
export function getPages(): Page[] {
  if (cache) return cache
  const file = path.join(process.cwd(), 'data', 'pages.json')
  if (!fs.existsSync(file)) {
    throw new Error('data/pages.json not found — run `npm run sync` first.')
  }
  cache = JSON.parse(fs.readFileSync(file, 'utf8')) as Page[]
  return cache
}

export const slugToSegments = (slug: string) => (slug === 'home' ? [] : slug.split('/').filter(Boolean))
export const slugToHref = (slug: string) => (slug === 'home' ? '/' : `/${slug}/`)

export function getPageBySegments(segments: string[] = []): Page | undefined {
  const slug = segments.length ? segments.join('/') : 'home'
  return getPages().find((p) => p.slug === slug)
}
