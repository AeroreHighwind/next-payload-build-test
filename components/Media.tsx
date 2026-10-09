import type { MediaDoc } from '@/lib/cms'

export function Media({ resource, className }: { resource?: MediaDoc | string | number | null; className?: string }) {
  if (!resource || typeof resource !== 'object') return null
  if (resource.mimeType?.startsWith('video/')) {
    return <video className={className} src={resource.url} controls />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={resource.url}
      alt={resource.alt ?? ''}
      width={resource.width ?? undefined}
      height={resource.height ?? undefined}
      loading="lazy"
    />
  )
}
