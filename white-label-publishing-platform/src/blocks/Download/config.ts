import type { Block, PayloadRequest } from 'payload'

export const Download: Block = {
  slug: 'download',
  interfaceName: 'DownloadBlock',
  labels: { singular: 'Material PDF', plural: 'Materiais PDF' },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Material de apoio' },
    { name: 'description', type: 'textarea' },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { equals: 'application/pdf' } },
      validate: async (value: unknown, { req }: { req: PayloadRequest }) => {
        if (!value) return 'Selecione um PDF.'
        const id = typeof value === 'object' && 'id' in value ? value.id : value
        try {
          const media = await req.payload.findByID({
            collection: 'media',
            id: Number(id),
            depth: 0,
            req,
          })
          return media.mimeType === 'application/pdf' || 'Selecione um arquivo PDF da biblioteca.'
        } catch {
          return 'PDF não encontrado na biblioteca.'
        }
      },
    },
  ],
}
