import type { ContentBlock } from '@/payload-types'

export type Column = NonNullable<ContentBlock['columns']>[number]

// Read only text nodes for labels; rich text is still rendered by Payload elsewhere.
export function columnTitle(column: Column, fallback: string): string {
  const first = column.richText?.root.children.find((node) => node.type === 'heading')
  function read(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const value = node as { text?: unknown; children?: unknown[] }
    return typeof value.text === 'string' ? value.text : value.children?.map(read).join('') || ''
  }
  return read(first) || fallback
}

export function getSafeResourceURL(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch {
    return undefined
  }
}
