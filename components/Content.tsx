import React from 'react'
import { Media } from './Media'
import { slugToHref } from '@/lib/cms'

/* ──────────────────────────────────────────────────────────────────────────
 * 1. RichText — Lexical (Payload's default editor) → React
 * ────────────────────────────────────────────────────────────────────────── */
type LNode = {
  type: string
  children?: LNode[]
  text?: string
  format?: number | string
  indent?: number
  tag?: string
  listType?: string
  checked?: boolean
  headerState?: number
  language?: string
  fields?: Record<string, any>
  value?: any
}

// text format bitmask
const BOLD = 1, ITALIC = 2, STRIKE = 4, UNDERLINE = 8, CODE = 16, SUB = 32, SUP = 64, MARK = 128
const ALIGN = ['left', 'center', 'right', 'justify', 'start', 'end']

function elStyle(n: LNode): React.CSSProperties | undefined {
  const s: React.CSSProperties = {}
  if (typeof n.format === 'string' && ALIGN.includes(n.format)) s.textAlign = n.format as any
  if (n.indent) s.paddingInlineStart = `${n.indent * 2}rem`
  return Object.keys(s).length ? s : undefined
}

function linkHref(f: Record<string, any> = {}) {
  if (f.linkType === 'internal' && f.doc?.value && typeof f.doc.value === 'object') {
    return slugToHref(f.doc.value.slug)
  }
  return f.url as string | undefined
}

function kids(nodes?: LNode[]) {
  return nodes?.map((n, i) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)
}

function renderNode(node: LNode): React.ReactNode {
  const style = elStyle(node)
  switch (node.type) {
    case 'text': {
      let el: React.ReactNode = node.text
      const f = typeof node.format === 'number' ? node.format : 0
      if (f & CODE) el = <code>{el}</code>
      if (f & SUB) el = <sub>{el}</sub>
      if (f & SUP) el = <sup>{el}</sup>
      if (f & MARK) el = <mark>{el}</mark>
      if (f & BOLD) el = <strong>{el}</strong>
      if (f & ITALIC) el = <em>{el}</em>
      if (f & STRIKE) el = <s>{el}</s>
      if (f & UNDERLINE) el = <u>{el}</u>
      return el
    }
    case 'linebreak': return <br />
    case 'tab': return '\t'
    case 'horizontalrule': return <hr />
    case 'paragraph':
      return <p style={style}>{node.children?.length ? kids(node.children) : <br />}</p>
    case 'heading': {
      const Tag = (node.tag ?? 'h2') as 'h1'
      return <Tag style={style}>{kids(node.children)}</Tag>
    }
    case 'quote': return <blockquote style={style}>{kids(node.children)}</blockquote>
    case 'code':
      return <pre><code data-language={node.language}>{kids(node.children)}</code></pre>
    case 'list': {
      if (node.listType === 'number') return <ol start={(node as any).start}>{kids(node.children)}</ol>
      return <ul data-check={node.listType === 'check' || undefined}>{kids(node.children)}</ul>
    }
    case 'listitem':
      return (
        <li>
          {typeof node.checked === 'boolean' && <input type="checkbox" checked={node.checked} disabled readOnly />}
          {kids(node.children)}
        </li>
      )
    case 'link':
    case 'autolink': {
      const href = linkHref(node.fields)
      const ext = node.fields?.newTab ? { target: '_blank', rel: 'noreferrer' } : {}
      return <a href={href} {...ext}>{kids(node.children)}</a>
    }
    case 'table': return <div className="table-wrap"><table><tbody>{kids(node.children)}</tbody></table></div>
    case 'tablerow': return <tr>{kids(node.children)}</tr>
    case 'tablecell': {
      const Tag = node.headerState ? 'th' : 'td'
      return <Tag>{kids(node.children)}</Tag>
    }
    case 'upload': return <Media resource={node.value} />
    case 'relationship': {
      const v = node.value
      return v && typeof v === 'object' && v.slug ? <a href={slugToHref(v.slug)}>{v.title ?? v.slug}</a> : null
    }
    case 'block':
    case 'inlineBlock':
      return node.fields ? <BlockView block={node.fields} /> : null
    default:
      return <>{kids(node.children)}</>
  }
}

export function RichText({ data }: { data?: { root?: LNode } | null }) {
  if (!data?.root) return null
  return <div className="richtext">{kids(data.root.children)}</div>
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. AutoRender — render every field of a page, in order, by shape
 * ────────────────────────────────────────────────────────────────────────── */

// Register custom components for specific block slugs, e.g.
//   blockOverrides.cta = (b) => <MyCta {...b} />
export const blockOverrides: Record<string, (block: any) => React.ReactNode> = {}

const TOP_SKIP = new Set([
  'id', 'slug', 'meta', 'createdAt', 'updatedAt', 'publishedAt', '_status',
  'breadcrumbs', 'parent', 'createdBy', 'updatedBy', 'populatedAuthors',
])
const NESTED_SKIP = new Set(['id', 'blockType', 'blockName'])

const isObj = (v: any): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v)
const isLexical = (v: any) => isObj(v) && isObj(v.root) && v.root.type === 'root'
const isMediaDoc = (v: any) => isObj(v) && typeof v.url === 'string' && typeof v.mimeType === 'string'
const isLinkField = (v: any) => isObj(v) && 'label' in v && ('url' in v || 'reference' in v)
const isPrimitive = (v: any) => typeof v === 'string' || typeof v === 'number'

function Fields({ obj, skip }: { obj: Record<string, any>; skip: Set<string> }) {
  return (
    <>
      {Object.entries(obj).map(([k, v]) =>
        skip.has(k) ? null : <Value key={k} name={k} value={v} top={skip === TOP_SKIP} />,
      )}
    </>
  )
}

function BlockView({ block }: { block: Record<string, any> }) {
  const custom = blockOverrides[block.blockType]
  if (custom) return <>{custom(block)}</>
  return (
    <section data-block={block.blockType}>
      <Fields obj={block} skip={NESTED_SKIP} />
    </section>
  )
}

function Value({ name, value, top }: { name: string; value: any; top?: boolean }) {
  if (value == null || value === '' || typeof value === 'boolean') return null

  if (typeof value === 'string') {
    return top && name === 'title' ? <h1>{value}</h1> : <p data-field={name}>{value}</p>
  }
  if (typeof value === 'number') return <p data-field={name}>{value}</p>

  if (isLexical(value)) return <div data-field={name}><RichText data={value} /></div>
  if (isMediaDoc(value)) return <figure data-field={name}><Media resource={value} /></figure>

  if (isLinkField(value)) {
    const href =
      value.type === 'reference' && isObj(value.reference?.value)
        ? slugToHref(value.reference.value.slug)
        : value.url
    return (
      <p data-field={name}>
        <a href={href} {...(value.newTab ? { target: '_blank', rel: 'noreferrer' } : {})}>{value.label}</a>
      </p>
    )
  }

  if (Array.isArray(value)) {
    if (!value.length) return null
    if (value.every(isPrimitive)) {
      return <ul data-field={name}>{value.map((v, i) => <li key={i}>{v}</li>)}</ul>
    }
    return (
      <div data-field={name}>
        {value.map((item, i) =>
          isObj(item) && typeof item.blockType === 'string'
            ? <BlockView key={i} block={item} />
            : <Value key={i} name={name} value={item} />,
        )}
      </div>
    )
  }

  if (isObj(value)) {
    // populated relationship to another page/doc → link
    if ('id' in value && typeof value.slug === 'string') {
      return <p data-field={name}><a href={slugToHref(value.slug)}>{value.title ?? value.slug}</a></p>
    }
    // group
    return (
      <div data-group={name}>
        <Fields obj={value} skip={NESTED_SKIP} />
      </div>
    )
  }
  return null
}

/** Renders all of a page's fields in the order Payload returned them. */
export function AutoRender({ data }: { data: Record<string, any> }) {
  return <Fields obj={data} skip={TOP_SKIP} />
}
