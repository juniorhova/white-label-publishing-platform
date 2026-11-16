import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { getYouTubeVideoID } from '@/utilities/youtube'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  { name: 'week', type: 'number', label: 'Semana do plano', min: 1, max: 52 },
  { name: 'weeklyGoal', type: 'textarea', label: 'Objetivo da semana' },
  { name: 'practice', type: 'textarea', label: 'Entrega prática da semana' },
  { name: 'stageGroup', type: 'text', label: 'Categoria do roadmap (opcional)' },
  { name: 'period', type: 'text', label: 'Período da experiência (opcional)' },
  {
    name: 'photos',
    type: 'array',
    label: 'Fotos da experiência',
    fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
  },
  {
    name: 'topics',
    type: 'array',
    label: 'Tópicos do roadmap',
    fields: [
      { name: 'label', type: 'text', label: 'Tópico', required: true },
      { name: 'description', type: 'textarea', label: 'O que estudar' },
      { name: 'resourceTitle', type: 'text', label: 'Nome do material' },
      {
        name: 'resourceURL',
        type: 'text',
        label: 'Link do material',
        validate: (value: string | null | undefined) => {
          if (!value) return true
          try {
            const url = new URL(value)
            return (
              (url.protocol === 'https:' && !url.username && !url.password) ||
              'Use um link HTTPS válido.'
            )
          } catch {
            return 'Use um link HTTPS válido.'
          }
        },
      },
    ],
  },
  {
    name: 'videoURL',
    type: 'text',
    label: 'Vídeo do YouTube (opcional)',
    admin: { description: 'Na apresentação em cartões, busca o título e a capa automaticamente.' },
    validate: (value: string | null | undefined) =>
      !value ||
      Boolean(getYouTubeVideoID(value)) ||
      'Informe uma URL HTTPS válida de um vídeo do YouTube.',
  },
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'appearance',
      type: 'select',
      label: 'Apresentação do conteúdo',
      options: [
        { label: 'Colunas padrão', value: 'default' },
        { label: 'Cartões de conteúdo', value: 'cards' },
        { label: 'Sobre — painel em destaque', value: 'about' },
        { label: 'Trajetória — linha do tempo', value: 'timeline' },
        { label: 'Roadmap — mapa interativo', value: 'roadmap' },
      ],
      admin: { description: 'Usa o mesmo conteúdo e links; altera apenas a apresentação pública.' },
    },
    { name: 'sectionTitle', type: 'text', label: 'Título da seção (opcional)' },
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
