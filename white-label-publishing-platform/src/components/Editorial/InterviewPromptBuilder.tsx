'use client'

import { Button } from '@/components/ui/button'
import { type FormEvent, useRef, useState } from 'react'

const fields = [
  { key: 'role', label: 'Cargo', hint: 'Ex.: Cloud Engineer', maxLength: 120 },
  {
    key: 'situation',
    label: 'Situação',
    hint: 'Qual era o problema e por que ele importava?',
    maxLength: 1200,
  },
  {
    key: 'task',
    label: 'Tarefa',
    hint: 'O que era sua responsabilidade no projeto?',
    maxLength: 1200,
  },
  {
    key: 'action',
    label: 'Ação',
    hint: 'O que você fez e por que escolheu esse caminho?',
    maxLength: 1200,
  },
  {
    key: 'result',
    label: 'Resultado',
    hint: 'O que mudou e como você sabe disso?',
    maxLength: 1200,
  },
] as const

type FieldKey = (typeof fields)[number]['key']

export function InterviewPromptBuilder() {
  const [values, setValues] = useState<Partial<Record<FieldKey, string>>>({})
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('')
  const [generated, setGenerated] = useState(false)
  const [needsRegeneration, setNeedsRegeneration] = useState(false)
  const previewRef = useRef<HTMLTextAreaElement>(null)

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const notes = fields.map(
      ({ key, label }) => `${label}: ${values[key]?.trim() || 'A esclarecer'}`,
    )
    setPrompt(
      [
        'Quero me preparar para uma entrevista em inglês usando um projeto real que eu fiz.',
        '',
        ...notes,
        '',
        'Organize minha história em STAR: situação, tarefa, ação e resultado. Se faltar contexto, faça uma pergunta por vez antes de montar a resposta.',
        'Separe minha contribuição da contribuição do time. Use os fatos que eu informar e preserve as incertezas. Se não houver uma métrica, me ajude a descrever o resultado com evidências que eu consiga explicar.',
        'Prepare uma resposta curta e natural em inglês. Depois, simule a entrevista em inglês: faça uma pergunta de aprofundamento por vez e espere minha resposta antes de continuar.',
      ].join('\n'),
    )
    setGenerated(true)
    setNeedsRegeneration(false)
    setStatus('Prompt gerado. Você pode revisar e editar o texto abaixo.')
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setStatus('Prompt copiado.')
    } catch {
      previewRef.current?.focus()
      previewRef.current?.select()
      setStatus('Texto selecionado. Use o comando de copiar do seu dispositivo.')
    }
  }

  const controlClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring'

  return (
    <div className="my-6 min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Use um projeto real e deixe nomes de clientes e detalhes internos de fora. O prompt é
        montado no seu navegador.
      </p>
      <form onSubmit={generate}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ key, label, hint, maxLength }) => {
            const id = `star-${key}`
            const value = values[key] || ''
            const required = key === 'role' || key === 'action'
            const handleChange = (text: string) => {
              setValues((current) => ({ ...current, [key]: text }))
              setNeedsRegeneration(generated)
              setStatus(generated ? 'Ficha alterada. Gere de novo para atualizar a prévia.' : '')
            }

            return (
              <div key={key} className={key === 'role' ? 'sm:col-span-2' : undefined}>
                <label htmlFor={id} className="block text-sm font-semibold">
                  {label}
                  {!required && (
                    <span className="ml-2 font-normal text-muted-foreground">opcional</span>
                  )}
                </label>
                <p id={`${id}-hint`} className="mb-1.5 mt-1 text-sm text-muted-foreground">
                  {hint}
                </p>
                {key === 'role' ? (
                  <input
                    id={id}
                    aria-describedby={`${id}-hint`}
                    className={controlClass}
                    value={value}
                    maxLength={maxLength}
                    required
                    onChange={(event) => handleChange(event.target.value)}
                  />
                ) : (
                  <textarea
                    id={id}
                    aria-describedby={`${id}-hint`}
                    className={`${controlClass} resize-y`}
                    value={value}
                    maxLength={maxLength}
                    rows={3}
                    required={required}
                    onChange={(event) => handleChange(event.target.value)}
                  />
                )}
              </div>
            )
          })}
        </div>
        <Button
          className="mt-4"
          type="submit"
          disabled={!values.role?.trim() || !values.action?.trim()}
        >
          {generated ? 'Gerar de novo' : 'Gerar prompt'}
        </Button>
      </form>

      {generated && (
        <div className="mt-5 border-t border-border pt-5">
          <label htmlFor="star-prompt" className="mb-2 block text-sm font-semibold">
            Seu prompt editável
          </label>
          <textarea
            ref={previewRef}
            id="star-prompt"
            className={`${controlClass} resize-y`}
            rows={11}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value)
              if (!needsRegeneration) setStatus('')
            }}
          />
          <Button
            className="mt-2"
            type="button"
            variant="outline"
            disabled={!prompt.trim() || needsRegeneration}
            onClick={copyPrompt}
          >
            Copiar prompt
          </Button>
        </div>
      )}
      <p role="status" className="mt-2 text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  )
}
