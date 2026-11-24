import { createElement } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InterviewPromptBuilder } from '@/components/Editorial/InterviewPromptBuilder'
import type { Post } from '@/payload-types'

vi.mock('@/components/RichText', () => ({
  default: ({ data }: { data: Post['content'] }) =>
    createElement(
      'div',
      null,
      data.root.children.flatMap((node, index) =>
        node.type === 'heading' && Array.isArray(node.children)
          ? [createElement('h2', { key: index }, node.children.map((child) => child.text).join(''))]
          : [],
      ),
    ),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function generateFromProject() {
  render(createElement(InterviewPromptBuilder))
  const generate = screen.getByRole('button', { name: 'Gerar prompt' })
  expect((generate as HTMLButtonElement).disabled).toBe(true)
  fireEvent.change(screen.getByLabelText('Cargo'), { target: { value: 'Cloud Engineer' } })
  fireEvent.change(screen.getByLabelText('Ação'), {
    target: { value: 'Automatizei o deploy e documentei a validação.' },
  })
  fireEvent.click(generate)
  return screen.getByLabelText<HTMLTextAreaElement>('Seu prompt editável')
}

describe('Interview prompt builder', () => {
  it('uses the project details, leaves gaps explicit, and copies the edited preview', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const preview = generateFromProject()
    expect(preview.value).toContain('Cargo: Cloud Engineer')
    expect(preview.value).toContain('Ação: Automatizei o deploy e documentei a validação.')
    expect(preview.value).toContain('Resultado: A esclarecer')
    expect(preview.value).toContain('faça uma pergunta de aprofundamento por vez')

    fireEvent.change(preview, { target: { value: 'Versão revisada pelo visitante' } })
    fireEvent.click(screen.getByRole('button', { name: 'Copiar prompt' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Versão revisada pelo visitante'))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Prompt copiado.'))
  })

  it('selects the prompt when the clipboard cannot be used', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard denied')) },
    })
    const preview = generateFromProject()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar prompt' }))
    await waitFor(() => expect(preview.selectionStart).toBe(0))
    expect(preview.selectionEnd).toBe(preview.value.length)
    expect(screen.getByRole('status').textContent).toContain('Texto selecionado.')
  })
})

describe('27 interviews article', () => {
  it('imports as a draft and renders the generator between the article heading and questions', async () => {
    const { readFile } = await import('node:fs/promises')
    const { articleData, validateImport } = await import('@/editorial/import')
    const { InterviewArticleBody } = await import('@/components/Editorial/InterviewArticleBody')
    const { default: config } = await import('@payload-config')
    const directory = 'content/articles/27-entrevistas-internacionais'
    const [manifest, markdown] = await Promise.all([
      readFile(directory + '.json', 'utf8'),
      readFile(directory + '.md', 'utf8'),
    ])
    const article = await articleData(validateImport({ ...JSON.parse(manifest), markdown }), {
      payload: { config: await config },
    } as never)
    expect(article._status).toBe('draft')
    expect(article.videoURL).toContain('coPH1HBW85A')

    render(createElement(InterviewArticleBody, { content: article.content }))
    const heading = screen.getByRole('heading', { name: 'Monte seu prompt de entrevista' })
    const form = screen.getByRole('button', { name: 'Gerar prompt' })
    const questions = screen.getByRole('heading', { name: '15 perguntas para treinar em inglês' })
    expect(heading.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(form.compareDocumentPosition(questions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
