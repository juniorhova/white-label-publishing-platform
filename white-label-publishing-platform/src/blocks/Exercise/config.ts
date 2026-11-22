import type { Block } from 'payload'
export const Exercise: Block = {
  slug: 'exercise',
  interfaceName: 'ExerciseBlock',
  labels: { singular: 'Atividade interativa', plural: 'Atividades interativas' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'mode',
      type: 'select',
      required: true,
      defaultValue: 'checklist',
      options: [
        { label: 'Checklist de prática', value: 'checklist' },
        { label: 'Explore um pipeline', value: 'pipeline' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 30,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'explanation', type: 'textarea', required: true },
      ],
    },
  ],
}
