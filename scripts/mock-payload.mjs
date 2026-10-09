// Tiny fake Payload API for testing the pipeline: `npm run mock-cms`
import http from 'node:http'
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const media = (name) => ({
  id: name, alt: 'Test image', filename: name, mimeType: 'image/png', width: 1, height: 1,
  url: `/api/media/file/${name}`, thumbnailURL: `/api/media/file/${name}`,
  sizes: { thumb: { url: `/api/media/file/thumb-${name}`, filename: `thumb-${name}`, mimeType: 'image/png', width: 1, height: 1 } },
})
const p = (text) => ({ type: 'paragraph', children: [{ type: 'text', text, format: 1 }] })
const docs = [
  { id: 1, title: 'Home', slug: 'home',
    hero: { richText: { root: { children: [{ type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Hello from Payload' }] }] } }, media: media('hero.png') },
    layout: [{ blockType: 'content', columns: [{ richText: { root: { children: [p('Column one'), { type: 'upload', value: media('inline.png') }] } } }] }],
    meta: { title: 'Home | My Site', description: 'Static home' } },
  { id: 2, title: 'About', slug: 'about', layout: [{ blockType: 'mediaBlock', media: media('hero.png') }] },
]
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x')
  if (u.pathname === '/api/pages') {
    res.setHeader('content-type', 'application/json')
    return res.end(JSON.stringify({ docs, hasNextPage: false, page: 1, totalPages: 1 }))
  }
  if (u.pathname.startsWith('/api/media/file/')) { res.setHeader('content-type', 'image/png'); return res.end(PNG) }
  res.statusCode = 404; res.end()
}).listen(3030, () => console.log('Mock Payload on http://localhost:3030'))
