import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { InterviewPromptBuilder } from './InterviewPromptBuilder'

const builderHeading = 'Monte seu prompt de entrevista'

export function InterviewArticleBody({ content }: { content: Post['content'] }) {
  const { root } = content
  const position = root.children.findIndex((node) => {
    if (node.type !== 'heading' || !Array.isArray(node.children)) return false
    return (
      node.children.map((child: { text?: string }) => child.text ?? '').join('') === builderHeading
    )
  })

  if (position < 0) {
    return (
      <>
        <RichText data={content} enableGutter={false} />
        <h2 className="mt-8 text-2xl font-semibold">{builderHeading}</h2>
        <InterviewPromptBuilder />
      </>
    )
  }

  const before = root.children.slice(0, position + 1)
  const after = root.children.slice(position + 1)
  return (
    <>
      <RichText data={{ root: { ...root, children: before } }} enableGutter={false} />
      <InterviewPromptBuilder />
      {after.length > 0 && (
        <RichText data={{ root: { ...root, children: after } }} enableGutter={false} />
      )}
    </>
  )
}
