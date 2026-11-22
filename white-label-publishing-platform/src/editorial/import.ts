import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { PayloadRequest } from 'payload'
import { getYouTubeVideoID } from '@/utilities/youtube'

type PDF = { type: 'pdf'; mediaId: number; title: string; description?: string }
type Activity = {
  type: 'checklist' | 'pipeline'
  title: string
  description?: string
  items: { label: string; explanation: string }[]
}
export type ImportArticle = {
  title: string
  slug: string
  markdown: string
  description?: string
  videoURL?: string
  categoryIds?: number[]
  heroImageId?: number
  blocks?: Record<string, PDF | Activity>
  expectedUpdatedAt?: string
  publish?: boolean
  apply?: boolean
}
export function validateImport(input: unknown): ImportArticle {
  if (!input || typeof input !== 'object') throw new Error('Artigo inválido.')
  const a = input as ImportArticle
  if (
    typeof a.title !== 'string' ||
    !a.title.trim() ||
    a.title.length > 200 ||
    typeof a.slug !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug) ||
    a.slug.length > 150 ||
    typeof a.markdown !== 'string' ||
    !a.markdown.trim() ||
    a.markdown.length > 200000
  )
    throw new Error('Título, slug ou Markdown inválidos.')
  if (a.videoURL && !getYouTubeVideoID(a.videoURL)) throw new Error('Vídeo do YouTube inválido.')
  if (a.description && (typeof a.description !== 'string' || a.description.length > 500))
    throw new Error('Descrição inválida.')
  if (
    a.categoryIds &&
    (!Array.isArray(a.categoryIds) ||
      a.categoryIds.length > 30 ||
      !a.categoryIds.every((n) => Number.isSafeInteger(n) && n > 0))
  )
    throw new Error('Categorias inválidas.')
  if (a.heroImageId && (!Number.isSafeInteger(a.heroImageId) || a.heroImageId < 1))
    throw new Error('Imagem inválida.')
  if (
    a.blocks &&
    (typeof a.blocks !== 'object' || Array.isArray(a.blocks) || Object.keys(a.blocks).length > 30)
  )
    throw new Error('Blocos inválidos.')
  for (const [key, b] of Object.entries(a.blocks || {})) {
    if (
      !/^[a-z0-9-]+$/.test(key) ||
      !b ||
      typeof b.title !== 'string' ||
      !b.title.trim() ||
      b.title.length > 200 ||
      (b.description && (typeof b.description !== 'string' || b.description.length > 2000))
    )
      throw new Error('Bloco inválido.')
    if (b.type === 'pdf') {
      if (!Number.isSafeInteger(b.mediaId) || b.mediaId < 1) throw new Error('PDF inválido.')
    } else if (
      (b.type !== 'checklist' && b.type !== 'pipeline') ||
      !Array.isArray(b.items) ||
      b.items.length < 1 ||
      b.items.length > 30 ||
      b.items.some(
        (i) =>
          typeof i.label !== 'string' ||
          !i.label.trim() ||
          i.label.length > 200 ||
          typeof i.explanation !== 'string' ||
          !i.explanation.trim() ||
          i.explanation.length > 3000,
      )
    )
      throw new Error('Atividade inválida.')
  }
  if (a.apply !== undefined && typeof a.apply !== 'boolean')
    throw new Error('apply deve ser booleano.')
  if (a.publish !== undefined && typeof a.publish !== 'boolean')
    throw new Error('publish deve ser booleano.')
  return a
}
export async function articleData(a: ImportArticle, req: PayloadRequest) {
  const editorConfig = await editorConfigFactory.default({ config: req.payload.config })
  const nodes: ReturnType<typeof convertMarkdownToLexical>['root']['children'] = []
  // Markers occupy their own paragraph; fenced code becomes the existing native Code block.
  const chunks = a.markdown.split(/(^```[^\n]*\n[\s\S]*?^```\s*$|^\{\{block:[a-z0-9-]+\}\}\s*$)/m)
  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    let fields: Record<string, unknown> | null = null
    const code = chunk.match(/^```([^\n]*)\n([\s\S]*?)\n```\s*$/)
    const marker = chunk.trim().match(/^\{\{block:([a-z0-9-]+)\}\}$/)
    if (code) {
      const aliases: Record<string, string> = { ts: 'typescript', js: 'javascript' }
      const language = aliases[code[1].trim()] || code[1].trim() || 'text'
      if (
        !['typescript', 'javascript', 'css', 'bash', 'json', 'yaml', 'python', 'text'].includes(
          language,
        )
      )
        throw new Error(`Linguagem não suportada: ${language}. Use text.`)
      fields = { blockType: 'code', language, code: code[2] }
    } else if (marker) {
      const b = a.blocks?.[marker[1]]
      if (!b) throw new Error(`Bloco não definido: ${marker[1]}`)
      if (b.type === 'pdf') {
        const media = await req.payload.findByID({
          collection: 'media',
          id: b.mediaId,
          depth: 0,
          overrideAccess: false,
          req,
        })
        if (media.mimeType !== 'application/pdf')
          throw new Error('O material selecionado não é PDF.')
        fields = {
          blockType: 'download',
          title: b.title,
          description: b.description,
          file: b.mediaId,
        }
      } else
        fields = {
          blockType: 'exercise',
          title: b.title,
          description: b.description,
          mode: b.type,
          items: b.items.map((i) => ({ label: i.label, explanation: i.explanation })),
        }
    }
    if (fields) nodes.push({ type: 'block', version: 2, format: '', fields } as never)
    else nodes.push(...convertMarkdownToLexical({ editorConfig, markdown: chunk }).root.children)
  }
  const checkLinks = (children: unknown[]) => {
    for (const child of children) {
      if (!child || typeof child !== 'object') continue
      const node = child as { fields?: { url?: unknown }; children?: unknown[] }
      if (node.fields?.url !== undefined) {
        const url = node.fields.url
        if (typeof url !== 'string' || !isSafeArticleURL(url))
          throw new Error('Link não permitido no Markdown.')
      }
      if (node.children) checkLinks(node.children)
    }
  }
  checkLinks(nodes)
  for (const node of nodes) {
    if (node.type === 'heading' && 'tag' in node && node.tag === 'h1') node.tag = 'h2'
  }
  for (const id of a.categoryIds || [])
    await req.payload.findByID({ collection: 'categories', id, overrideAccess: false, req })
  if (a.heroImageId)
    await req.payload.findByID({
      collection: 'media',
      id: a.heroImageId,
      overrideAccess: false,
      req,
    })
  return {
    title: a.title.trim(),
    slug: a.slug,
    content: {
      root: {
        type: 'root' as const,
        version: 1,
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        children: nodes,
      },
    },
    meta: { description: a.description || '' },
    videoURL: a.videoURL || null,
    categories: a.categoryIds || [],
    ...(a.heroImageId ? { heroImage: a.heroImageId } : {}),
    _status: a.publish ? ('published' as const) : ('draft' as const),
  }
}

export function isSafeArticleURL(value: string) {
  if (/^(\/(?!\/)|#)/.test(value) && !/[\\\s]/.test(value)) return true
  try {
    const url = new URL(value)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) && !url.username && !url.password
  } catch {
    return false
  }
}
