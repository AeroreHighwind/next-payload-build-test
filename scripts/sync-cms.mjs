/**
 * Pre-build sync: pulls every page from Payload and downloads every media file
 * they reference, so `next build` needs NO network access to the CMS.
 *
 *   data/pages.json          <- all pages, media URLs rewritten to local paths
 *   public/cms-assets/*      <- every referenced file (originals + image sizes)
 *
 * Set SKIP_SYNC=1 to reuse the previous sync (e.g. CMS is offline).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

for (const f of ['.env', '.env.local']) {
  try { process.loadEnvFile(f) } catch {}
}

if (process.env.SKIP_SYNC) {
  console.log('[sync] SKIP_SYNC set — using existing data/ and public/cms-assets/')
  process.exit(0)
}

const CMS = (process.env.PAYLOAD_URL || '').replace(/\/+$/, '')
const COLLECTION = process.env.PAYLOAD_PAGES_COLLECTION || 'pages'
const DEPTH = process.env.PAYLOAD_DEPTH || '3'
const API_KEY = process.env.PAYLOAD_API_KEY
const API_KEY_COLLECTION = process.env.PAYLOAD_API_KEY_COLLECTION || 'users'

if (!CMS) {
  console.error('[sync] PAYLOAD_URL is not set (see .env.example)')
  process.exit(1)
}

const ROOT = process.cwd()
const DATA_FILE = path.join(ROOT, 'data', 'pages.json')
const ASSET_DIR = path.join(ROOT, 'public', 'cms-assets')
const ASSET_PUBLIC = '/cms-assets'

const authHeaders = API_KEY ? { Authorization: `${API_KEY_COLLECTION} API-Key ${API_KEY}` } : {}

async function http(url, { retries = 3, ...opts } = {}) {
  let lastErr
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, opts)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return res
    } catch (err) {
      lastErr = err
      if (i < retries) await new Promise((r) => setTimeout(r, 500 * i))
    }
  }
  throw new Error(`Request failed: ${url} (${lastErr?.message})`)
}

// ---- 1. Fetch all pages (paginated) -----------------------------------------
async function fetchAllPages() {
  const docs = []
  let page = 1
  while (true) {
    const url = `${CMS}/api/${COLLECTION}?limit=100&page=${page}&depth=${DEPTH}&draft=false`
    const json = await (await http(url, { headers: authHeaders })).json()
    docs.push(...json.docs)
    if (!json.hasNextPage) break
    page = json.nextPage ?? page + 1
  }
  return docs
}

// ---- 2. Find media objects anywhere in the tree -----------------------------
// A populated Payload upload doc (and each of its `sizes.*`) has url+filename+mimeType.
const isMedia = (n) =>
  n && typeof n === 'object' && !Array.isArray(n) &&
  typeof n.url === 'string' && typeof n.filename === 'string' && typeof n.mimeType === 'string'

function collectMedia(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => collectMedia(n, out))
  else if (node && typeof node === 'object') {
    if (isMedia(node)) out.push(node)
    Object.values(node).forEach((n) => collectMedia(n, out))
  }
  return out
}

// ---- 3. Download + rewrite --------------------------------------------------
const remoteToLocal = new Map() // absolute remote URL -> local public path
const nameOwner = new Map()     // local filename -> absolute remote URL

function localNameFor(absUrl) {
  const base = decodeURIComponent(path.basename(new URL(absUrl).pathname)).replace(/[^\w.\-]+/g, '_')
  const owner = nameOwner.get(base)
  if (!owner || owner === absUrl) { nameOwner.set(base, absUrl); return base }
  const name = `${crypto.createHash('sha1').update(absUrl).digest('hex').slice(0, 8)}-${base}`
  nameOwner.set(name, absUrl)
  return name
}

async function download(absUrl, name) {
  const sameOrigin = new URL(absUrl).origin === new URL(CMS).origin
  const res = await http(absUrl, { headers: sameOrigin ? authHeaders : {} })
  await fs.writeFile(path.join(ASSET_DIR, name), Buffer.from(await res.arrayBuffer()))
}

async function pool(items, size, fn) {
  const queue = [...items]
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) await fn(queue.shift())
  }))
}

// ---- main -------------------------------------------------------------------
console.log(`[sync] Fetching "${COLLECTION}" from ${CMS}`)
const pages = await fetchAllPages()
console.log(`[sync] ${pages.length} page(s)`)

const mediaObjs = collectMedia(pages)
const toFetch = new Map()
for (const m of mediaObjs) {
  const abs = new URL(m.url, CMS + '/').toString()
  if (!remoteToLocal.has(abs)) {
    const name = localNameFor(abs)
    remoteToLocal.set(abs, `${ASSET_PUBLIC}/${name}`)
    toFetch.set(abs, name)
  }
}

await fs.rm(ASSET_DIR, { recursive: true, force: true }) // drop stale files
await fs.mkdir(ASSET_DIR, { recursive: true })
console.log(`[sync] Downloading ${toFetch.size} asset(s)`)
await pool([...toFetch], 6, ([abs, name]) => download(abs, name))

for (const m of mediaObjs) {
  m.url = remoteToLocal.get(new URL(m.url, CMS + '/').toString())
  if (m.thumbnailURL) {
    const t = remoteToLocal.get(new URL(m.thumbnailURL, CMS + '/').toString())
    m.thumbnailURL = t ?? null
  }
}

await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
await fs.writeFile(DATA_FILE + '.tmp', JSON.stringify(pages, null, 2))
await fs.rename(DATA_FILE + '.tmp', DATA_FILE)
console.log('[sync] Done ->', path.relative(ROOT, DATA_FILE))
