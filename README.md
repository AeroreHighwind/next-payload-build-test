# Payload → Next.js static export

```bash
cp .env.example .env.local   # set PAYLOAD_URL (+ API key if needed)
npm install
npm run build                # runs `sync` automatically via prebuild, then next build
```
Result: `./out` — plain static files. Copy it to the serving machine; it never talks to the CMS.

- `npm run sync` – only fetch pages + assets (`data/pages.json`, `public/cms-assets/`)
- `SKIP_SYNC=1 npm run build` – rebuild from the last sync (CMS offline)
- `npm run mock-cms` – fake Payload on :3030 for testing (`PAYLOAD_URL=http://localhost:3030`)

Adapt `lib/cms.ts` (types) and `components/Blocks.tsx` (block renderers) to your collection schema.
