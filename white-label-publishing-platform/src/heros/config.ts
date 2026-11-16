import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { getYouTubeVideoID, validateSocialURL } from '@/utilities/youtube'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        { label: 'Apresentação pessoal', value: 'portfolio' },
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Especialidade',
      admin: { condition: (_, siblingData) => siblingData?.type === 'portfolio' },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Apresentação',
      admin: { condition: (_, siblingData) => siblingData?.type === 'portfolio' },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: unknown }) =>
        (siblingData as { type?: string })?.type !== 'portfolio' ||
        Boolean(value?.trim()) ||
        'Informe um título para a apresentação.',
    },
    {
      name: 'introduction',
      type: 'textarea',
      label: 'Descrição',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'portfolio',
        description: 'Um parágrafo curto sobre você. O site cuida da formatação.',
      },
    },
    {
      name: 'youtubeDescription',
      type: 'textarea',
      label: 'Descrição do vídeo em destaque',
      admin: { condition: (_, siblingData) => siblingData?.type === 'portfolio' },
    },
    {
      name: 'youtubeVideoURL',
      type: 'text',
      label: 'Vídeo em destaque — URL do YouTube',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'portfolio',
        description:
          'Cole o link do vídeo. Título e imagem são consultados no YouTube; a reprodução ocorre nesta página.',
      },
      validate: (value: string | null | undefined) =>
        !value ||
        Boolean(getYouTubeVideoID(value)) ||
        'Informe uma URL HTTPS válida de um vídeo do YouTube.',
    },
    {
      name: 'youtubeURL',
      type: 'text',
      label: 'YouTube — perfil',
      admin: { condition: (_, siblingData) => siblingData?.type === 'portfolio' },
      validate: (value: string | null | undefined) => validateSocialURL(value, 'youtube'),
    },
    {
      name: 'githubURL',
      type: 'text',
      label: 'GitHub — perfil',
      admin: { condition: (_, siblingData) => siblingData?.type === 'portfolio' },
      validate: (value: string | null | undefined) => validateSocialURL(value, 'github'),
    },
    {
      name: 'linkedinURL',
      type: 'text',
      label: 'LinkedIn — perfil',
      admin: { condition: (_, siblingData) => siblingData?.type === 'portfolio' },
      validate: (value: string | null | undefined) => validateSocialURL(value, 'linkedin'),
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
      admin: { condition: (_, siblingData) => siblingData?.type !== 'portfolio' },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'portfolio'].includes(type),
        description:
          'Na apresentação pessoal, deixe vazio para usar a foto inicial incluída no site.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
        !['highImpact', 'mediumImpact'].includes((siblingData as { type?: string })?.type || '') ||
        Boolean(value) ||
        'Selecione uma imagem para esta apresentação.',
    },
  ],
  label: false,
}
