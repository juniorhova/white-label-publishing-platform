'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Script from 'next/script'
type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
type Comment = { id: number; name: string; text: string; createdAt: string }
export function Community({ postId }: { postId: number }) {
  const [data, setData] = useState<{
    comments: Comment[]
    counts: Record<string, number>
    enabled: boolean
  } | null>(null)
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const api = () => (window as unknown as { turnstile?: Turnstile }).turnstile
  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/community/${postId}`)
      if (r.ok) setData(await r.json())
      else setMessage('Comentários indisponíveis no momento.')
    } catch {
      setMessage('Comentários indisponíveis no momento.')
    }
  }, [postId])
  useEffect(() => {
    void Promise.resolve().then(load)
    return () => {
      if (widget.current) api()?.remove(widget.current)
      widget.current = null
    }
  }, [load])
  const mount = useCallback(() => {
    if (ref.current && api() && !widget.current)
      widget.current = api()!.render(ref.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        action: 'post-interaction',
        callback: (v: string) => setToken(v),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      })
  }, [])
  useEffect(() => {
    if (data?.enabled) mount()
  }, [data?.enabled, mount])
  async function submit(body: Record<string, unknown>) {
    setBusy(true)
    setMessage('')
    try {
      const r = await fetch(`/api/community/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, token }),
      })
      const result = await r.json()
      setMessage(result.message || result.error)
      if (r.ok) await load()
    } catch {
      setMessage('Não foi possível enviar. Tente novamente.')
    } finally {
      setBusy(false)
      setToken('')
      if (widget.current) api()?.reset(widget.current)
    }
  }
  return (
    <section className="editorial-related" aria-label="Comentários e reações">
      <h2 className="text-2xl font-bold">O que você achou?</h2>
      <div className="editorial-filters">
        {[
          ['like', '❤️ Gostei'],
          ['helpful', '👏 Foi útil'],
          ['insightful', '💡 Aprendi algo'],
        ].map(([kind, label]) => (
          <button
            type="button"
            key={kind}
            disabled={!token || busy || !data?.enabled}
            onClick={() => void submit({ type: 'reaction', kind })}
          >
            {label} · {data?.counts[kind] || 0}
          </button>
        ))}
      </div>
      <h2 className="text-2xl font-bold mt-8">Comentários</h2>
      {data?.comments.map((c) => (
        <article key={c.id} className="editorial-panel">
          <strong>{c.name}</strong>
          <small> · {new Date(c.createdAt).toLocaleDateString('pt-BR')}</small>
          <p style={{ whiteSpace: 'pre-wrap' }}>{c.text}</p>
        </article>
      ))}
      {data && !data.comments.length && <p className="my-4">Seja a primeira pessoa a comentar.</p>}
      {data?.enabled ? (
        <>
          <p className="my-4 text-sm">
            Comentários passam por aprovação. Seu nome e texto ficam públicos após aprovação; não
            inclua dados pessoais. Usamos um cookie para limitar envios e registrar uma reação por
            navegador, além da verificação Cloudflare Turnstile.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              void submit({ type: 'comment', name: f.get('name'), text: f.get('text') })
            }}
          >
            <label htmlFor="reader-name">Seu nome</label>
            <input
              id="reader-name"
              name="name"
              required
              maxLength={80}
              className="editorial-input"
            />
            <label htmlFor="reader-comment">Comentário</label>
            <textarea
              id="reader-comment"
              name="text"
              required
              maxLength={3000}
              rows={4}
              className="editorial-input"
            />
            <button className="editorial-action" disabled={!token || busy} type="submit">
              {busy ? 'Enviando…' : 'Enviar para aprovação'}
            </button>
          </form>
          <div className="my-4" ref={ref} />
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            onReady={mount}
          />
        </>
      ) : (
        data && (
          <p className="my-4">Novos comentários e reações estão temporariamente indisponíveis.</p>
        )
      )}
      <p role="status" className="my-4">
        {message}
      </p>
    </section>
  )
}
