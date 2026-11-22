import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: { singular: 'Comentário', plural: 'Comentários' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'post', 'status', 'createdAt'],
    description:
      'Novos comentários aguardam aprovação. Marque como aprovado para exibir no artigo.',
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true, index: true },
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    { name: 'text', type: 'textarea', required: true, maxLength: 3000 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Aguardando aprovação', value: 'pending' },
        { label: 'Aprovado', value: 'approved' },
        { label: 'Rejeitado', value: 'rejected' },
      ],
    },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      index: true,
      admin: { hidden: true },
      access: { read: () => false },
    },
  ],
}
export const Reactions: CollectionConfig = {
  slug: 'reactions',
  labels: { singular: 'Reação', plural: 'Reações' },
  admin: { defaultColumns: ['post', 'kind', 'createdAt'] },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true, index: true },
    { name: 'kind', type: 'select', required: true, options: ['like', 'helpful', 'insightful'] },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      admin: { hidden: true },
      access: { read: () => false },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true },
      access: { read: () => false },
    },
  ],
}
