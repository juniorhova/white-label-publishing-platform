'use client'
import React, { useEffect, useState } from 'react'
type Heading = { id: string; title: string; level: number }
export function ReaderTools() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState('')
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<{ id: string; text: string }[]>([])
  useEffect(() => {
    const root = document.getElementById('article-body')
    if (!root) return
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('h1,h2,h3,h4'))
    nodes.forEach((node, i) => {
      node.id = `section-${i + 1}`
    })
    const frame = requestAnimationFrame(() =>
      setHeadings(
        nodes.map((n) => ({
          id: n.id,
          title: n.textContent || '',
          level: Number(n.tagName.slice(1)),
        })),
      ),
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-10% 0px -55% 0px' },
    )
    nodes.forEach((n) => observer.observe(n))
    if (location.hash.startsWith('#section-'))
      document.getElementById(location.hash.slice(1))?.scrollIntoView()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const root = document.getElementById('article-body')
      if (!root || query.trim().length < 2) {
        setMatches([])
        return
      }
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('p,li,h1,h2,h3,h4,pre'))
      nodes.forEach((n, i) => {
        if (!n.id) n.id = `reader-text-${i}`
      })
      setMatches(
        nodes
          .filter((n) =>
            n.textContent?.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
          )
          .slice(0, 30)
          .map((n, i) => {
            if (!n.id) n.id = `search-result-${i}`
            return { id: n.id, text: (n.textContent || '').slice(0, 180) }
          }),
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [query])
  return (
    <aside className="reader-nav" aria-label="Ferramentas de leitura">
      <label htmlFor="search-this-article">Buscar neste artigo</label>
      <input
        className="editorial-input"
        id="search-this-article"
        type="search"
        maxLength={120}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim().length >= 2 && (
        <div>
          <p role="status">
            {matches.length}
            {matches.length === 30 ? '+' : ''} trechos encontrados
          </p>
          {matches.map((m) => (
            <a className="reader-result" key={m.id} href={`#${m.id}`}>
              {m.text}
            </a>
          ))}
        </div>
      )}
      <h2 className="font-bold my-4">Nesta página</h2>
      <nav>
        {headings.map((h) => (
          <a
            style={{ paddingLeft: Math.max(0, h.level - 2) * 12 + 12 }}
            key={h.id}
            href={`#${h.id}`}
            aria-current={active === h.id ? 'location' : undefined}
          >
            {h.title}
          </a>
        ))}
      </nav>
    </aside>
  )
}
